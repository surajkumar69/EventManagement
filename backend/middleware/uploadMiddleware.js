import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// Ensure uploads folder exists locally
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File Filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Middleware to handle Cloudinary upload or fallback to local URL
export const uploadBanner = async (req, res, next) => {
  const uploadSingle = upload.single('banner');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return next(); // Proceed without file if not uploaded (optional field handle)
    }

    try {
      if (isCloudinaryConfigured()) {
        // Upload local file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'events',
          resource_type: 'image',
        });

        // Delete local temporary file
        fs.unlinkSync(req.file.path);

        // Attach Cloudinary URL to request object
        req.fileUrl = result.secure_url;
      } else {
        // Fallback to serving the local file statically
        const host = req.get('host');
        const protocol = req.protocol;
        req.fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      }
      next();
    } catch (uploadErr) {
      console.error('File upload processing error:', uploadErr);
      // Clean up local file if Cloudinary fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: 'Error uploading image' });
    }
  });
};
