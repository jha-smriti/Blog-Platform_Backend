# Blog Platform Backend

A comprehensive Node.js/Express.js backend API for a blog platform with user authentication, post management, comments, likes, and real-time notifications.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Blog Post Management**: Full CRUD operations for blog posts
- **Image Upload**: File upload support for post images using Multer
- **Comment System**: Nested commenting system for posts
- **Like/Unlike**: Interactive like functionality for posts
- **Notification System**: Real-time notifications for user interactions
- **Caching**: Node-cache implementation for improved performance
- **Security**: Cookie-based JWT tokens with proper middleware protection
- **Database**: MongoDB integration with Mongoose ODM

## 🛠️ Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs
- **File Upload**: Multer
- **Caching**: Node-cache
- **Security**: CORS, Cookie-parser
- **Environment**: dotenv

## 📁 Project Structure

```
Blog-Platform_Backend/
├── config/
│   ├── db.js              # MongoDB connection configuration
│   └── cache.js           # Node-cache configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── postController.js  # Post management logic
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── models/
│   ├── User.js           # User schema
│   ├── Post.js           # Post schema with comments
│   └── Notifications.js  # Notification schema
├── routes/
│   ├── authRoutes.js     # Authentication endpoints
│   ├── postRoutes.js     # Post management endpoints
│   └── notificationRoutes.js # Notification endpoints
├── uploads/              # Directory for uploaded images
├── server.js            # Main application entry point
└── package.json         # Project dependencies and scripts
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/jha-smriti/Blog-Platform_Backend.git
cd Blog-Platform_Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/blog-platform
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-platform

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Server Port (optional)
PORT=5000
```

### 4. Create Required Directories

```bash
mkdir uploads
```

### 5. Start the Server

```bash
npm start
```

The server will start on `http://localhost:5000` (or your specified PORT).

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | User logout | No |

#### Example: User Registration
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Post Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/posts/public` | Get all posts | No |
| GET | `/api/posts/latest` | Get latest posts | No |
| GET | `/api/posts/my-posts` | Get current user's posts | Yes |
| GET | `/api/posts/:id` | Get single post | No |
| POST | `/api/posts/create` | Create new post | Yes |
| PUT | `/api/posts/:id` | Update post | Yes |
| DELETE | `/api/posts/:id` | Delete post | Yes |
| POST | `/api/posts/like/:postId` | Toggle like/unlike | Yes |
| POST | `/api/posts/comment/:postId` | Add comment | Yes |
| GET | `/api/posts/:id/comments` | Get comments | No |

#### Example: Create Post
```bash
POST /api/posts/create
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "title": "My Blog Post",
  "content": "This is the content of my blog post...",
  "image": <file> // optional
}
```

### Notification Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/notifications` | Get user notifications | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |
| PUT | `/api/notifications/mark-read` | Mark all as read | Yes |

## 🗃️ Database Schemas

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

### Post Model
```javascript
{
  username: String (required),
  title: String (required),
  content: String (required),
  imageUrl: String (optional),
  author: ObjectId (ref: User),
  likes: [ObjectId] (ref: User),
  comments: [{
    user: ObjectId (ref: User),
    username: String,
    text: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

### Notification Model
```javascript
{
  recipient: ObjectId (ref: User),
  sender: ObjectId (ref: User),
  post: ObjectId (ref: Post),
  type: String (like, comment),
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) stored in HTTP-only cookies for authentication. Include the token in requests to protected endpoints.

### Protected Routes
- All `/api/posts` POST, PUT, DELETE operations
- `/api/auth/me`
- All `/api/notifications` endpoints
- Post like/comment functionality

## 🖼️ File Upload

Images are uploaded to the `/uploads` directory and served statically at `/uploads/<filename>`. Supported formats depend on your Multer configuration.

## 🚦 CORS Configuration

CORS is configured to allow requests from `http://localhost:3000` with credentials enabled, suitable for frontend integration.

## 🔧 Development

### Available Scripts

```bash
npm start    # Start the server
npm test     # Run tests (currently not configured)
```

### Adding New Features

1. Create new routes in the `/routes` directory
2. Implement controllers in `/controllers`
3. Add middleware if needed in `/middleware`
4. Update models in `/models` if database changes are required
5. Update this README with new API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Issues & Support

For issues, questions, or contributions, please create an issue in the GitHub repository.

## 🚀 Deployment

### Environment Variables for Production
- Ensure `MONGO_URI` points to your production MongoDB instance
- Use a strong, unique `JWT_SECRET`
- Set appropriate `PORT` for your hosting platform
- Configure CORS origins for your production frontend URL

### Recommended Hosting Platforms
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

---

Made with ❤️ by [jha-smriti](https://github.com/jha-smriti)