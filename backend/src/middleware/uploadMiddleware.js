import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

// ---- Storage configuration ----

const cloudinaryPropertyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'landledger/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit' }],
  },
});

const cloudinaryProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'landledger/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, crop: 'limit' }],
  },
});

const diskImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/documents');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ---- File filters ----

const propertyFileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (file.fieldname === 'documents') {
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'];
    if (allowedExts.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only JPG, JPEG, PNG, WEBP, and PDF files are allowed for documents'), false);
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
  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, JPEG, PNG, WEBP, and PDF files are allowed'), false);
  }
};

// ---- Multer instances ----

/** Upload property images (to Cloudinary) and documents (to disk/cloud) */
const uploadPropertyFiles = multer({
  storage: cloudinaryPropertyStorage,
  fileFilter: propertyFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
]);

/** Upload up to 10 images to Cloudinary (max 10 MB each) */
const uploadImages = multer({
  storage: cloudinaryPropertyStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('images', 10);

/** Upload up to 5 documents (max 5 MB each) */
const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('documents', 5);

/** Upload a single profile image (max 5 MB) */
const uploadProfileImage = multer({
  storage: cloudinaryProfileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('profileImage');

export { uploadPropertyFiles, uploadImages, uploadDocuments, uploadProfileImage };

