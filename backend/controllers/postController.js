import Post from '../models/postModel.js';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import User from '../models/userModel.js';

const getPosts = async (req, res) => {
  try {

    const { lat, lng, dist, excludeId, type, search } = req.query;
    let query = {};

    if (lat && lng && lat !== 'undefined' && lng !== 'undefined') {
      const maxDistance = dist ? Number(dist) * 1000 : 10000; // Default 10km
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: maxDistance,
        },
      };
    }

    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query.user = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },       // 'i' makes it case-insensitive
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name profilePicture karmaPoints');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, description, type, category, latitude, longitude, address } = req.body;

    const post = new Post({
      user: req.user._id,
      title,
      description,
      type,
      category,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
        address,
      },
    });

    const createdPost = await post.save();

    const fullPost = await Post.findById(createdPost._id).populate('user', 'name profilePicture karmaPoints');

    const io = req.app.get('socketio');

    io.emit('new-post', fullPost);
    res.status(201).json(fullPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      if (post.user.toString() === req.user._id.toString()) {
        await post.deleteOne();
        const io = req.app.get('socketio');
        if (io) {
            io.emit('post-deleted', req.params.id);
        }
        res.json({ message: 'Post removed' });
      } else {
        res.status(401).json({ message: 'Not authorized to delete this post' });
      }
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendSummary = async (req, res) => {
  const { lat, lng, dist, excludeId } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ summary: "Location required" });
  }

  try {
    const radiusInKm = dist ? parseFloat(dist) : 5; // Increased default to 50km
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // console.log(`🔎 Scanning for trends near [${userLng}, ${userLat}] within ${radiusInKm}km...`);

    const matchStage = {
      location: {
        $geoWithin: {
          $centerSphere: [[userLng, userLat], radiusInKm / 6378.1],
        },
      },
      status: 'open',
    };

    if (excludeId) {
      matchStage.user = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const trends = await Post.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          categories: { $push: "$category" }
        }
      }
    ]);

    // console.log("📊 Trend Query Result:", JSON.stringify(trends, null, 2));

    if (trends.length === 0) {
      return res.json({
        summary: "No recent activity from others to summarize."
      });
    }

    const requestDoc = trends.find(t => t._id === 'request');
    const offerDoc = trends.find(t => t._id === 'offer');

    const reqCount = requestDoc ? requestDoc.count : 0;
    const offerCount = offerDoc ? offerDoc.count : 0;

    const getTopCategory = (doc) => {
      if (!doc) return null;
      const counts = {};
      doc.categories.forEach(c => counts[c] = (counts[c] || 0) + 1);
      return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };

    const topReqCat = getTopCategory(requestDoc);
    const topOfferCat = getTopCategory(offerDoc);

    let summaryText = "";
    if (reqCount > offerCount) {
      summaryText = `High demand for ${topReqCat || 'help'} nearby (${reqCount} requests).`;
    } else if (offerCount > reqCount) {
      summaryText = `Locals are offering ${topOfferCat || 'help'} (${offerCount} active offers).`;
    } else {
      summaryText = `Balanced activity in your area (${reqCount} requests, ${offerCount} offers).`;
    }

    res.json({
      summary: summaryText,
      mostNeeded: topReqCat,
      mostOffered: topOfferCat
    });

  } catch (error) {
    console.error("Trend Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const fulfillPost = async (req, res) => {
  const { helperId } = req.body; // The ID of the person who helped
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 1. Security Check: Only the post creator can mark it as done
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized. Only the owner can fulfill this.' });
    }

    // 2. Prevent double-rewarding
    if (post.status === 'fulfilled') {
      return res.status(400).json({ message: 'Post is already fulfilled' });
    }
    const io = req.app.get('socketio');
    // 3. Update the Post
    post.status = 'fulfilled';
    post.fulfilledBy = helperId;
    await post.save();

    if (io) {
        io.emit('post-completed', post._id); 
    }

    // 4. Award Karma to the Helper
    if (helperId) {
      const helper = await User.findByIdAndUpdate(
        helperId,
        { $inc: { karmaPoints: 10 } }, // Increment by 10
        { new: true }
      );

      if (io && helper) {

        io.to(helperId.toString()).emit('notification', {
          message: `You earned 10 Karma for helping with "${post.title}"!`,
          newKarma: helper.karmaPoints
        });

        io.emit("karma-updated", {
          userId: helper._id,
          karmaPoints: helper.karmaPoints
        });
      }
    }

    res.json(post);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getPosts, createPost, deletePost, getMyPosts, getTrendSummary, fulfillPost };