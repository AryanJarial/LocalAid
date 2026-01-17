import express from 'express';
import { getPosts, createPost, deletePost, getMyPosts, getTrendSummary ,fulfillPost} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.route('/').get(getPosts).post(protect, createPost);

router.get('/trends', getTrendSummary);

router.get('/me',protect, getMyPosts);

router.route('/:id').delete(protect, deletePost);

router.route('/:id/fulfill').put(protect, fulfillPost);

export default router;