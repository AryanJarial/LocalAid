import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

const accessConversation = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.sendStatus(400);

  if (req.user._id.toString() === userId) {
     return res.status(400).send("Cannot chat with yourself");
  }

  const currentUserId = new mongoose.Types.ObjectId(req.user._id);
  const targetUserId = new mongoose.Types.ObjectId(userId);

  let isChat = await Conversation.find({
    members: { 
      $all: [currentUserId, targetUserId] 
    }
  })
  .populate("members", "-password")
  .populate({
    path: "latestMessage",
    populate: { path: "sender", select: "name profilePicture email" }
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      members: [currentUserId, targetUserId],
    };

    try {
      const createdChat = await Conversation.create(chatData);
      const FullChat = await Conversation.findOne({ _id: createdChat._id })
        .populate("members", "-password");
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
};

const fetchChats = async (req, res) => {
  try {
    Conversation.find({ members: { $elemMatch: { $eq: req.user._id } } })
      .populate("members", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name profilePicture email" }
      })
      .sort({ updatedAt: -1 })
      .then((results) => res.status(200).send(results));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  const { conversationId, text, image } = req.body;

  if (!conversationId || (!text && !image)) {
    return res.status(400).json({ message: "Invalid data" });
  }

  var newMessage = {
    sender: req.user._id,
    text: text,
    image: image,
    conversationId: conversationId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name profilePicture");
    message = await message.populate("conversationId");
    message = await User.populate(message, {
      path: "conversationId.members",
      select: "name profilePicture email",
    });

    await Conversation.findByIdAndUpdate(req.body.conversationId, {
      latestMessage: message,
    });

    const io = req.app.get('socketio');
    message.conversationId.members.forEach((user) => {
      if (user._id == message.sender._id) return; // Don't send to self
      io.to(user._id.toString()).emit('message received', message);
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate("sender", "name profilePicture email")
      .populate("conversationId");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { accessConversation, fetchChats, sendMessage, allMessages };