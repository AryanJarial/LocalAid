import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/profile', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'localaid_profiles', 
    });

    const user = await User.findById(req.user._id);
    if (user) {
      user.profilePicture = result.secure_url;
      await user.save();
      
      res.json({ 
        message: 'Image uploaded', 
        imageUrl: result.secure_url 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.post('/message', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'localaid_chat', 
    });

    res.json({ 
      imageUrl: result.secure_url 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Chat image upload failed' });
  }
});

router.post(
  '/post-images',
  protect,
  upload.array('images', 4),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }

      const uploadPromises = req.files.map(file => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        return cloudinary.uploader.upload(dataURI, {
          folder: 'localaid_posts',
        });
      });

      const results = await Promise.all(uploadPromises);

      res.json({
        images: results.map(r => r.secure_url),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Post image upload failed' });
    }
  }
);


export default router;