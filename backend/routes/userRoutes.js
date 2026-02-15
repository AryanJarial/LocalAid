import express from 'express';
import { registerUser, authUser} from '../controllers/userController.js';
import { sendOtp } from '../controllers/userController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', authUser);

export default router;