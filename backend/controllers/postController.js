import Post from '../models/postModel.js';
import mongoose from 'mongoose';
import OpenAI from 'openai';

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
      .populate('user', 'name profilePicture'); 

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

    const fullPost = await Post.findById(createdPost._id).populate('user', 'name profilePicture');

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
  try {
    const { lat, lng, excludeId } = req.query; 

    const query = {
      type: 'request', 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    };

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: 10000 
        }
      };
    }

    if (excludeId) {
      query.user = { $ne: excludeId };
    }

    const posts = await Post.find(query).limit(20).select('title category');
    
    if (posts.length === 0) {
      return res.json({ summary: "No recent activity from others to summarize." });
    }

    const postTitles = posts.map(p => `- ${p.title} (${p.category})`).join('\n');

    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI Key found. Using Mock AI.");
      
      const categories = {};
      posts.forEach(p => { categories[p.category] = (categories[p.category] || 0) + 1; });
      const topCategory = Object.keys(categories).sort((a,b) => categories[b] - categories[a])[0];

      return res.json({ 
        summary: `(Mock AI): There is a high demand for ${topCategory} in your area. Residents are actively looking for help with ${posts[0].title} and similar items.` 
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful community assistant." },
        { role: "user", content: `Here are recent help requests in this neighborhood:\n${postTitles}\n\nSummarize the top 3 most critical needs in 1 short sentence. Don't mention names.` }
      ],
      model: "gpt-3.5-turbo",
    });

    res.json({ summary: completion.choices[0].message.content });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "Unable to generate summary." });
  }
};

export { getPosts, createPost, deletePost, getMyPosts, getTrendSummary };