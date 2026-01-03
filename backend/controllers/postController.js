import Post from '../models/postModel.js';

const getPosts = async (req, res) => {
  try {
    const { lat, lng, dist, excludeId } = req.query;

    let query = {};

    if (lat && lng) {
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

    if (excludeId) {
      query.user = { $ne: excludeId };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name'); 

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
    res.status(201).json(createdPost);
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

export { getPosts, createPost, deletePost };