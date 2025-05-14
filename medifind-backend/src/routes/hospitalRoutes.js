import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createHospital,
  deleteHospital,
  updateHospital,
  getHospital,
  getAllHospitals,
  getSearchedHospitals
} from '../controllers/hospitalController.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = Router();

// Image upload route
router.post('/upload', upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No files uploaded',
      });
    }
    const urls = files.map((file) => `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${file.filename}`);
    res.status(200).json({
      status: 'success',
      data: { urls },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to upload images: ${error.message}`,
    });
  }
});

// Hospital routes
router.get('/hospitals', getAllHospitals);
router.get('/hospitals/:id', getHospital);
router.post('/hospitals', createHospital);
router.patch('/hospitals/:id', updateHospital);
router.delete('/hospitals/:id', deleteHospital);
router.get('/hospitals/search', getSearchedHospitals);

export default router;