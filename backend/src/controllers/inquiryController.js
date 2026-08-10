import Inquiry from '../models/Inquiry.js';
import Property from '../models/Property.js';
import { logger } from '../utils/logger.js';

/**
 * @desc    Submit a new inquiry
 * @route   POST /api/inquiries
 * @access  Public / Optional Auth
 */
export const createInquiry = async (req, res, next) => {
  try {
    const { propertyId, name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required fields.',
      });
    }

    let validPropertyId = null;
    if (propertyId) {
      const propExists = await Property.findById(propertyId);
      if (propExists) {
        validPropertyId = propExists._id;
      }
    }

    const inquiryData = {
      name,
      email,
      phone: phone || '',
      subject,
      message,
      property: validPropertyId,
      user: req.user ? req.user._id : null,
    };

    const inquiry = await Inquiry.create(inquiryData);
    const populated = await Inquiry.findById(inquiry._id).populate('property', 'propertyId surveyNumber city state price');

    logger.info(`Inquiry created [ID: ${inquiry._id}] for ${email}`);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inquiries with optional filter
 * @route   GET /api/inquiries
 * @access  Private (Authenticated users / Admin / Officer / Seller)
 */
export const getInquiries = async (req, res, next) => {
  try {
    const { propertyId, status, myInquiries } = req.query;
    const filter = {};

    if (propertyId) {
      filter.property = propertyId;
    }

    if (status) {
      filter.status = status;
    }

    // If regular buyer requests "myInquiries", limit to their user ID or email
    if (myInquiries === 'true' && req.user) {
      filter.$or = [
        { user: req.user._id },
        { email: req.user.email },
      ];
    } else if (req.user && req.user.role === 'seller') {
      // Sellers can see inquiries for properties they own
      const sellerProperties = await Property.find({ owner: req.user._id }).select('_id');
      const propIds = sellerProperties.map((p) => p._id);
      filter.property = { $in: propIds };
    }

    const inquiries = await Inquiry.find(filter)
      .populate('property', 'propertyId surveyNumber landType city state price')
      .populate('user', 'fullName email phone role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single inquiry by ID
 * @route   GET /api/inquiries/:id
 * @access  Private
 */
export const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('property', 'propertyId surveyNumber landType city state price owner')
      .populate('user', 'fullName email phone');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inquiry status & official response
 * @route   PATCH /api/inquiries/:id
 * @access  Private (Officer / Admin / Seller)
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, response } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    if (status) inquiry.status = status;
    if (response !== undefined) inquiry.response = response;

    await inquiry.save();

    const updated = await Inquiry.findById(inquiry._id)
      .populate('property', 'propertyId surveyNumber city state price')
      .populate('user', 'fullName email');

    logger.info(`Inquiry [ID: ${inquiry._id}] status updated to ${inquiry.status}`);

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inquiry
 * @route   DELETE /api/inquiries/:id
 * @access  Private (Admin / Officer / Owner)
 */
export const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    await inquiry.deleteOne();

    logger.info(`Inquiry [ID: ${req.params.id}] deleted`);

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
