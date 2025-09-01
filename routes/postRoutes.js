const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/authMiddleware');

const {
  createPost,
  getAllPosts,
  getUserPosts,
  getLatestPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  getComments,

} = require('../controllers/postController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.post('/create', authenticateToken, upload.single('image'), createPost);
router.get('/public', getAllPosts);
router.get('/my-posts', authenticateToken, getUserPosts);
router.get('/latest', getLatestPosts); // <--- NEW route
router.get('/:id', getPostById);
router.put('/:id', authenticateToken, upload.single('image'), updatePost);
router.delete('/:id', authenticateToken, deletePost);
// Like/unlike post
router.post('/like/:postId', authenticateToken, toggleLike);

// Add comment
router.post('/comment/:postId', authenticateToken, addComment);

// (Optional) Get comments
router.get('/comment/:postId', getComments);

module.exports = router;
