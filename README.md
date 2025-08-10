# 💬 ChatNest

A modern, real-time chat application built with React.js and Node.js. Features include private messaging, group chats, file sharing, voice/video calls, and more.

![ChatNest Demo](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=ChatNest+Demo)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with password reset
- 💬 **Real-time Messaging** - Instant messaging with Socket.IO
- 👥 **Group Chats** - Create and manage group conversations
- 📁 **File Sharing** - Images, documents, audio, and video support
- 📞 **Voice/Video Calls** - WebRTC-powered calling system
- 😀 **Message Reactions** - Emoji reactions and replies
- 🌙 **Dark/Light Theme** - Beautiful UI with theme switching
- 👫 **Friend System** - Add friends and manage connections
- 🔍 **Search** - Find users and search through messages
- 📱 **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Cloudinary account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chatnest.git
   cd chatnest
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Environment Variables**
   ```env
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/chatnest
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **Socket.IO** - Real-time events
- **JWT** - Authentication
- **Cloudinary** - File storage
- **Winston** - Logging

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Chats
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create chat/group
- `GET /api/messages/:chatId` - Get messages

### Users
- `GET /api/users/search` - Search users
- `POST /api/friends/request` - Send friend request

### Upload
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/chat/:chatId` - Upload files

## 🔌 Socket Events

### Client → Server
- `join_room` - Join chat room
- `send_message` - Send message
- `typing` - Start typing
- `initiate_call` - Start call

### Server → Client
- `receive_message` - New message
- `user_typing` - User typing
- `incoming_call` - Incoming call
- `user_online` - User online status

## 🚀 Deployment

### Using PM2
```bash
# Backend
npm install -g pm2
pm2 start server.js --name chatnest-backend

# Frontend (build first)
npm run build
pm2 serve build 3000 --name chatnest-frontend
```

### Using Docker
```bash
# Backend
docker build -t chatnest-backend .
docker run -p 5000:5000 chatnest-backend

# Frontend
docker build -t chatnest-frontend .
docker run -p 3000:3000 chatnest-frontend
```

## 📁 Project Structure

```
chatnest/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   └── server.js
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Cloudinary for file storage
- Tailwind CSS for styling
- The React and Node.js communities

---

⭐ **Star this repo if you found it helpful!**
