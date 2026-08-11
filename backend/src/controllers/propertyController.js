import Property from '../models/Property.js';
import ApiError from '../utils/ApiError.js';

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
      status,
      page = 1,
      limit = 100,
    } = req.query;

    // Build dynamic filter using nested fields
    const filter = {};
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (landType) filter['landDetails.landType'] = new RegExp(landType, 'i');
    if (status) filter['verification.status'] = status;

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
    } = req.body;

    // Collect uploaded file paths into documents array
    let documentsArray = [];
    if (req.files?.images) {
      documentsArray = documentsArray.concat(
        req.files.images.map((f) => ({ type: 'Other', url: f.path }))
      );
    }
    if (req.files?.documents) {
      documentsArray = documentsArray.concat(
        req.files.documents.map((f) => ({ type: 'Other', url: f.path }))
      );
    }

    const property = await Property.create({
      ownerId: req.user._id,
      location: {
        surveyNumber,
        district,
        state,
        city,
        latitude,
        longitude,
      },
      landDetails: {
        landType,
        areaSqft: area,
      },
      pricing: {
        priceINR: price,
      },
      verification: {
        status: 'Pending',
        remarks: description,
      },
      documents: documentsArray,
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
    if (
      property.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(403, 'Not authorized to update this property')
      );
    }

    // Since req.body might be flat from an old frontend or nested,
    // we should ideally expect the frontend to send the nested structure.
    // For now we just pass req.body directly to findByIdAndUpdate.
    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
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

    if (
      property.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ApiError(403, 'Not authorized to delete this property')
      );
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
    const { status } = req.body;

    if (!['Verified', 'Rejected'].includes(status) && !['verified', 'rejected'].includes(status)) {
      return next(
        new ApiError(400, 'Status must be "Verified" or "Rejected"')
      );
    }

    const properStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { 'verification.status': properStatus, 'verification.verifiedBy': req.user._id, 'verification.verificationDate': new Date() },
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

export {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  verifyProperty,
};
