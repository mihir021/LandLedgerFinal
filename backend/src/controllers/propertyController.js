import Property from '../models/Property.js';
import Transfer from '../models/Transfer.js';
import ApiError from '../utils/ApiError.js';
import logAudit from '../utils/auditLogger.js';
import { syncTransferStatus } from '../services/blockchainService.js';
import cloudinary from '../config/cloudinary.js';

// =====================================================
// @desc    Get all properties (with optional filters)
// @route   GET /api/properties
// @access  Public
// =====================================================
const getProperties = async (req, res, next) => {
  try {
    const {
      state,
      district,
      city,
      landType,
      verificationStatus,
      status,
      listed,
      owner,
      page = 1,
      limit = 2000,
    } = req.query;

    // Build dynamic filter using nested and top-level fields safely with $and
    const filter = {};
    const andConditions = [];

    if (state) {
      andConditions.push({
        $or: [
          { state: new RegExp(state, 'i') },
          { 'location.state': new RegExp(state, 'i') },
        ],
      });
    }
    if (district) {
      andConditions.push({
        $or: [
          { district: new RegExp(district, 'i') },
          { 'location.district': new RegExp(district, 'i') },
        ],
      });
    }
    if (city) {
      andConditions.push({
        $or: [
          { city: new RegExp(city, 'i') },
          { 'location.city': new RegExp(city, 'i') },
        ],
      });
    }
    if (landType) {
      andConditions.push({
        $or: [
          { landType: new RegExp(landType, 'i') },
          { 'landDetails.landType': new RegExp(landType, 'i') },
        ],
      });
    }
    if (verificationStatus || status) {
      const val = verificationStatus || status;
      andConditions.push({
        $or: [
          { verificationStatus: new RegExp(`^${val}$`, 'i') },
          { 'verification.status': new RegExp(`^${val}$`, 'i') },
        ],
      });
    }
    if (listed !== undefined) {
      filter.isListed = listed === 'true';
    }
    if (owner) {
      andConditions.push({
        $or: [
          { owner: owner },
          { ownerId: owner },
          { currentOwnerWallet: owner },
          { previousOwners: owner },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Properties retrieved',
      data: {
        properties,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
// =====================================================
const getPropertyById = async (req, res, next) => {
  try {
    // Sync-on-read for any pending transfers on this property
    const pendingTransfer = await Transfer.findOne({
      propertyId: req.params.id,
      status: { $in: ['pendingRequest', 'pending'] },
    });
    if (pendingTransfer) {
      await syncTransferStatus(pendingTransfer);
    }

    const property = await Property.findById(req.params.id).populate(
      'ownerId',
      'name email phone walletAddress'
    );

    if (!property) {
      return next(new ApiError(404, 'Property not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Property retrieved',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (seller)
// =====================================================
const createProperty = async (req, res, next) => {
  try {
    const {
      surveyNumber,
      district,
      state,
      city,
      address, // Note: no explicit address field in new schema, maybe map to pincode or taluka, or just ignore.
      landType,
      area,
      price,
      description,
      latitude,
      longitude,
      txHash,
      blockchainParcelId,
      walletAddress
    } = req.body;

    // Collect uploaded Cloudinary image objects ({ url, public_id })
    const imageObjects = req.files?.images
      ? req.files.images.map((f) => ({
          url: f.path,
          public_id: f.filename || f.public_id,
        }))
      : [];

    const docObjects = req.files?.documents
      ? req.files.documents.map((f) => ({
          type: 'Other',
          url: f.path,
          public_id: f.filename || f.public_id,
          uploadedAt: new Date(),
        }))
      : [];

    const MAP_LAND_TYPE = {
      agricultural: 'Agricultural Land',
      residential: 'Residential Plot',
      commercial: 'Commercial Land',
      industrial: 'Industrial Land',
      mixed: 'Residential Plot',
    };

    const enumLandType = MAP_LAND_TYPE[landType?.toLowerCase()] || 'Residential Plot';

    const property = await Property.create({
      propertyId: `LAND-REG-${surveyNumber}`,
      surveyNumber,
      owner: req.user._id,
      ownerId: req.user._id,

      // Top-level fields
      district,
      state,
      city,
      address,
      landType,
      verificationStatus: 'Pending',
      area: Number(area),
      price: Number(price),
      description,
      latitude,
      longitude,

      // Nested schema fields for consistency with seeded data
      location: {
        state,
        district,
        city,
        surveyNumber,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      },
      landDetails: {
        landType: enumLandType,
        areaSqft: Number(area),
      },
      pricing: {
        priceINR: Number(price),
        pricePerSqft: Number(area) > 0 ? Math.round(Number(price) / Number(area)) : 0,
      },
      verification: {
        status: 'Pending',
      },
      isListed: true,

      images: imageObjects,
      documents: docObjects,
      currentOwnerWallet: walletAddress || req.user.walletAddress || null,
      blockchainTx: txHash || null,
      blockchainPropertyId: txHash ? blockchainParcelId || surveyNumber : null,
      blockchain: txHash ? {
        txHash,
        parcelId: blockchainParcelId || surveyNumber,
        contractAddress: process.env.LAND_LEDGER_CONTRACT_ADDRESS || undefined,
        chainNetwork: 'Arbitrum Sepolia',
      } : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (seller — owner only)
// =====================================================
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ApiError(404, 'Property not found'));
    }

    // Only the owner or an admin can update
    const ownerId =
      property.ownerId || property.owner;
    if (
      (!ownerId || ownerId.toString() !== req.user._id.toString()) &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(403, 'Not authorized to update this property')
      );
    }

    let imageObjects = [...(property.images || [])];

    // Delete removed images from Cloudinary if requested
    if (req.body.removedImageIds) {
      const idsToRemove = Array.isArray(req.body.removedImageIds)
        ? req.body.removedImageIds
        : [req.body.removedImageIds];

      for (const publicId of idsToRemove) {
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error(`Failed to destroy Cloudinary image ${publicId}:`, err);
          }
        }
      }

      imageObjects = imageObjects.filter(
        (img) => typeof img === 'object' && !idsToRemove.includes(img.public_id)
      );
    }

    // Append new uploaded Cloudinary images
    if (req.files?.images && req.files.images.length > 0) {
      const newImages = req.files.images.map((f) => ({
        url: f.path,
        public_id: f.filename || f.public_id,
      }));
      imageObjects = [...imageObjects, ...newImages];
    }

    const updatePayload = { ...req.body, images: imageObjects };

    property = await Property.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (seller — owner, or admin)
// =====================================================
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ApiError(404, 'Property not found'));
    }

    const ownerId =
      property.ownerId || property.owner;
    if (
      (!ownerId || ownerId.toString() !== req.user._id.toString()) &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(403, 'Not authorized to delete this property')
      );
    }

    // Delete all associated Cloudinary images
    if (property.images && property.images.length > 0) {
      for (const img of property.images) {
        const publicId = typeof img === 'object' ? img.public_id : null;
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error(`Failed to delete Cloudinary image ${publicId}:`, err);
          }
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Verify a property (officer/admin)
// @route   PUT /api/properties/:id/verify
// @access  Private (officer, admin)
// =====================================================

const verifyProperty = async (req, res, next) => {
  try {
    const { status, txHash } = req.body;

    if (!['Verified', 'Rejected'].includes(status) && !['verified', 'rejected'].includes(status)) {
      return next(
        new ApiError(400, 'Status must be "Verified" or "Rejected"')
      );
    }

    const properStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const updateData = {
      verificationStatus: properStatus,
      'verification.status': properStatus,
      'verification.verifiedBy': req.user._id,
      'verification.verificationDate': new Date()
    };
    if (txHash) {
      updateData['blockchain.txHash'] = txHash;
      updateData['blockchain.contractAddress'] = process.env.LAND_LEDGER_CONTRACT_ADDRESS || undefined;
      updateData['blockchain.chainNetwork'] = 'Arbitrum Sepolia';
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!property) {
      return next(new ApiError(404, 'Property not found'));
    }

    res.status(200).json({
      success: true,
      message: `Property ${properStatus}`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Toggle property listing on/off (seller — owner only)
// @route   PUT /api/properties/:id/listing
// @access  Private (seller, admin)
// =====================================================
const toggleListing = async (req, res, next) => {
  try {
    const { isListed } = req.body;

    if (typeof isListed !== 'boolean') {
      return next(new ApiError(400, 'isListed must be a boolean'));
    }

    const property = await Property.findById(req.params.id);
    if (!property) return next(new ApiError(404, 'Property not found'));

    const ownerId = property.ownerId || property.owner;
    if (
      (!ownerId || ownerId.toString() !== req.user._id.toString()) &&
      req.user.role !== 'admin'
    ) {
      return next(new ApiError(403, 'Not authorized to update this property'));
    }

    if (isListed && (property.verificationStatus || property.verification?.status)?.toLowerCase() !== 'verified') {
      return next(
        new ApiError(400, 'Only verified properties can be listed for sale')
      );
    }

    property.isListed = isListed;
    await property.save();

    await logAudit({
      req,
      action: isListed ? 'property.list' : 'property.unlist',
      targetType: 'Property',
      targetId: property._id,
      details: { propertyId: property.propertyId },
    });

    res.status(200).json({
      success: true,
      message: isListed ? 'Property listed for sale' : 'Property unlisted',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Get property history / title chain
// @route   GET /api/properties/:id/history
// @access  Public
// =====================================================
const getPropertyHistory = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'fullName email')
      .select('propertyId surveyNumber owner verificationStatus createdAt blockchainTx');

    if (!property) return next(new ApiError(404, 'Property not found'));

    // All transfers tied to this property, oldest first
    const transfers = await Transfer.find({ propertyId: req.params.id })
      .populate('fromUserId', 'name email fullName')
      .populate('toUserId', 'name email fullName')
      .sort({ createdAt: 1 });

    // Build a title-chain timeline: registration -> verification -> transfers
    const history = [
      {
        stage: 'Property Registered',
        label: 'Registered',
        actor: property.owner?.fullName || 'System',
        timestamp: property.createdAt,
        details: `Property ${property.propertyId} registered in the land registry.`,
        transactionHash: property.blockchainTx,
      },
      {
        stage: 'Property Verified',
        label: 'Verified',
        actor: 'Government Officer',
        timestamp: property.updatedAt,
        details:
          property.verificationStatus === 'verified'
            ? 'Property documents verified by the government officer.'
            : `Current verification status: ${property.verificationStatus}.`,
        transactionHash: null,
      },
      ...transfers.map((t) => ({
        stage: 'Ownership Transferred',
        label: 'Transfer',
        actor: t.fromUserId?.fullName || t.fromUserId?.name || 'Unknown',
        timestamp: t.createdAt,
        details: `Ownership transferred from ${t.fromUserId?.fullName || t.fromUserId?.name || 'seller'} to ${t.toUserId?.fullName || t.toUserId?.name || 'buyer'}. Status: ${t.status}.`,
        transactionHash: t.transactionHash,
        status: t.status,
      })),
    ];

    res.status(200).json({
      success: true,
      message: 'Property history retrieved',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
  toggleListing,
  getPropertyHistory,
};
