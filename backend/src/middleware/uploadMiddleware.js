import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../utils/ApiError.js';

// ---- Storage configuration ----

const imageStorage = multer.diskStorage({
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

// ---- File filter ----

const imageFilter = (_req, file, cb) => {
  const allowed = /jpg|jpeg|png/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype.split('/')[1]);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, JPEG, and PNG images are allowed'), false);
  }
};

const documentFilter = (_req, file, cb) => {
  const allowed = /jpg|jpeg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimeOk =
    file.mimetype === 'application/pdf' ||
    /image\/(jpeg|jpg|png)/.test(file.mimetype);

  if (allowed.test(ext) && mimeOk) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Only JPG, JPEG, PNG, and PDF files are allowed'),
      false
    );
  }
};

// ---- Multer instances ----

/** Upload up to 5 images (max 5 MB each) */
const uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).array('images', 5);

/** Upload up to 5 documents (max 5 MB each) */
const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('documents', 5);

/** Upload a single profile image (max 5 MB) */
const uploadProfileImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('profileImage');

export { uploadImages, uploadDocuments, uploadProfileImage };
