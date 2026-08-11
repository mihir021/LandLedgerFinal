import Property from '../models/Property.js';
import Transfer from '../models/Transfer.js';
import ApiError from '../utils/ApiError.js';
import logAudit from '../utils/auditLogger.js';

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
      listed,
      owner,
      page = 1,
      limit = 10,
    } = req.query;

    // Build dynamic filter
    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (city) filter.city = city;
    if (landType) filter.landType = landType;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (listed !== undefined) filter.isListed = listed === 'true';
    if (owner) filter.owner = owner;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .populate('owner', 'fullName email phone')
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
    const property = await Property.findById(req.params.id).populate(
      'owner',
      'fullName email phone walletAddress'
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
      address,
      landType,
      area,
      price,
      description,
      latitude,
      longitude,
    } = req.body;

    // Collect uploaded file paths
    const images = req.files?.images
      ? req.files.images.map((f) => f.path)
      : [];
    const documents = req.files?.documents
      ? req.files.documents.map((f) => f.path)
      : [];

    const property = await Property.create({
      surveyNumber,
      owner: req.user._id,
      district,
      state,
      city,
      address,
      landType,
      area,
      price,
      description,
      latitude,
      longitude,
      images,
      documents,
      currentOwnerWallet: req.user.walletAddress || null,
    });

    // TODO: Call Stylus Smart Contract Here — register property on-chain
    // After successful on-chain registration, update:
    //   property.blockchainPropertyId = <on-chain ID>
    //   property.blockchainTx = <transaction hash>
    //   await property.save();

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
    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(403, 'Not authorized to update this property')
      );
    }

    // Merge uploaded files if provided
    if (req.files?.images) {
      req.body.images = [
        ...property.images,
        ...req.files.images.map((f) => f.path),
      ];
    }
    if (req.files?.documents) {
      req.body.documents = [
        ...property.documents,
        ...req.files.documents.map((f) => f.path),
      ];
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // TODO: Call Stylus Smart Contract Here — update property metadata on-chain

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

    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(403, 'Not authorized to delete this property')
      );
    }

    await Property.findByIdAndDelete(req.params.id);

    // TODO: Call Stylus Smart Contract Here — deactivate or mark property as deleted on-chain

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
    const { verificationStatus } = req.body;

    if (!['verified', 'rejected'].includes(verificationStatus)) {
      return next(
        new ApiError(400, 'Verification status must be "verified" or "rejected"')
      );
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true, runValidators: true }
    );

    if (!property) {
      return next(new ApiError(404, 'Property not found'));
    }

    // TODO: Call Stylus Smart Contract Here — update verification status on-chain

    res.status(200).json({
      success: true,
      message: `Property ${verificationStatus}`,
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

    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new ApiError(403, 'Not authorized to update this property'));
    }

    if (isListed && property.verificationStatus !== 'verified') {
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

    // All transfers tied to this property, newest first
    const transfers = await Transfer.find({ property: req.params.id })
      .populate('seller', 'fullName email')
      .populate('buyer', 'fullName email')
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
        actor: t.seller?.fullName || 'Unknown',
        timestamp: t.createdAt,
        details: `Ownership transferred from ${t.seller?.fullName || 'seller'} to ${t.buyer?.fullName || 'buyer'}. Status: ${t.status}.`,
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
