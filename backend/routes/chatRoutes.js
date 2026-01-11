import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  accessConversation, 
  fetchChats, 
  sendMessage, 
  allMessages 
} from '../controllers/chatController.js';

const router = express.Router();

router.route('/').post(protect, accessConversation); 
router.route('/').get(protect, fetchChats);          
router.route('/message').post(protect, sendMessage); 
router.route('/:conversationId').get(protect, allMessages); 

export default router;