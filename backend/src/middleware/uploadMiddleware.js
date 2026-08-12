import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

// ---- Storage configuration ----

const cloudinaryMultiStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    const isDoc = file.fieldname === 'documents';
    return {
      folder: isDoc ? 'landledger/documents' : 'landledger/properties',
      resource_type: 'auto',
    };
  },
});

// ---- File filters ----

const propertyFileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (file.fieldname === 'documents') {
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
    if (allowedExts.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only JPG, JPEG, PNG, WEBP, PDF, and DOC/DOCX files are allowed for documents'), false);
    }
  } else {
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only image files (JPG, JPEG, PNG, WEBP) are allowed for property images'), false);
    }
  }
};

const imageFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files (JPG, JPEG, PNG, WEBP) are allowed'), false);
  }
};

const documentFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, JPEG, PNG, WEBP, PDF, and DOC/DOCX files are allowed'), false);
  }
};

// ---- Multer instances ----

/** Upload property images and documents directly to Cloudinary */
const uploadPropertyFiles = multer({
  storage: cloudinaryMultiStorage,
  fileFilter: propertyFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
]);

/** Upload up to 10 images to Cloudinary (max 10 MB each) */
const uploadImages = multer({
  storage: cloudinaryMultiStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('images', 10);

/** Upload up to 5 documents to Cloudinary (max 10 MB each) */
const uploadDocuments = multer({
  storage: cloudinaryMultiStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('documents', 5);

/** Upload a single profile image to Cloudinary */
const uploadProfileImage = multer({
  storage: cloudinaryMultiStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('profileImage');

export { uploadPropertyFiles, uploadImages, uploadDocuments, uploadProfileImage };

