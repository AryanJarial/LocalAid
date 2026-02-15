import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

import Otp from '../models/otpModel.js';
import nodemailer from 'nodemailer';


export const registerUser = async (req, res) => {
  const { name, email, password, otp } = req.body;

  try {
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password,});

    if (user) {
      await Otp.findOneAndDelete({ email });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        karmaPoints: user.karmaPoints,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndDelete({ email });
    await Otp.create({ email, otp });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'LocalAid - Email Verification OTP',
      html: `<h3>Your Verification Code is: <b>${otp}</b></h3><p>This code will expire in 5 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to email successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

