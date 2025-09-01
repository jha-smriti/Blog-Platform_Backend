const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notifications');
const cache = require('../config/cache');
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPost = new Post({
      username: user.username,
      title,
      content,
      imageUrl,
      author: user._id,
    });

    await newPost.save();

    // ❌ Invalidate latest posts cache
    cache.del('latest_posts');

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: error.message || 'Server Error' });
  }
};



exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'email username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Get Post By ID Error:', error);
    res.status(500).json({ error: 'Failed to fetch the post' });
  }
};


exports.getAllPosts = async (req, res) => {
  
  try {
    const posts = await Post.find().populate('author', 'email username');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

exports.getLatestPosts = async (req, res) => {
  try {
    const cacheKey = 'latest_posts';

    const cachedPosts = cache.get(cacheKey);
    if (cachedPosts) {
      console.log('⚡ Served from in-memory cache');
      return res.status(200).json(cachedPosts);
    }

    const latestPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'email username');

    // ✅ Convert Mongoose documents to plain JS objects
    const plainPosts = latestPosts.map(post => post.toObject());

    cache.set(cacheKey, plainPosts);

    res.status(200).json(plainPosts);
  } catch (error) {
    console.error('Fetch Latest Posts Error:', error);
    res.status(500).json({ error: 'Failed to fetch latest posts' });
  }
};



exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== userId) return res.status(403).json({ msg: 'Unauthorized' });

    post.title = req.body.title;
    post.content = req.body.content;

    if (req.file) {
      post.imageUrl = `/uploads/${req.file.filename}`;
    }

    await post.save();
    res.json({ msg: 'Post updated successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;


    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }


    // Compare the author with the logged-in user
    if (!post.author || post.author.toString() !== userId) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
cache.del('latest_posts');
    // Delete the post
    await Post.findByIdAndDelete(postId);
    res.json({ msg: 'Post deleted successfully' });

  } catch (error) {
    console.error('🔥 Server error while deleting post:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id.toString();

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const index = post.likes.findIndex(uid => uid && uid.toString() === userId);
    const alreadyLiked = index !== -1;
    let liked;

    if (!alreadyLiked) {
      post.likes.push(userId);
      liked = true;

      // Only notify if liker is not the author
      if (post.author.toString() !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          post: post._id,
          type: 'like',
          message: `${req.user.username} liked your post.`,
        });
      }
    } else {
      post.likes.splice(index, 1);
      liked = false;
    }

    await post.save();

    res.json({ liked, likes: post.likes.length });
  } catch (err) {
    console.error('Toggle Like Error:', err);
    res.status(500).json({ error: 'Error toggling like' });
  }
};



exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user?._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Add comment
    post.comments.push({ user: userId, text, username: user.username });
    await post.save();

    // Send notification (only if not commenting on your own post)
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        post: post._id,
        type: 'comment',
        message: `${user.username} commented on your post.`,
      });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};



exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching comments' });
  }
};




