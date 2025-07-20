A modern, full-stack online code editor built with React, Node.js, and MongoDB. Features real-time code execution, project management, and a beautiful Monaco Editor interface.

## Features

- 🚀 **Real-time Code Execution** - Execute code in multiple languages (JavaScript, Python, Java, C++, PHP)
- 💾 **Project Management** - Create, save, and organize your coding projects
- 🎨 **Monaco Editor** - VS Code-like editing experience with syntax highlighting
- 🔐 **Authentication** - Secure user registration and login with JWT
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🌙 **Multiple Themes** - Dark, light, and high contrast themes
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code's editor
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **JDoodle API** - Code execution service

## Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- JDoodle API credentials

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd codearena
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**

Create `.env` in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://pantdhara5:XFepqxMqQizKLUdX@cluster0.x94eaox.mongodb.net/codearena
JWT_SECRET=your_super_secret_jwt_key_here
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
```

Create `.env` in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Get JDoodle API credentials**
- Sign up at [JDoodle](https://www.jdoodle.com/compiler-api)
- Get your client ID and secret
- Add them to your server `.env` file

5. **Start the development servers**
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

## Usage

1. **Register/Login** - Create an account or login
2. **Create Projects** - Click "New Project" to create a coding project
3. **Code Editor** - Write code with syntax highlighting and auto-completion
4. **Execute Code** - Click "Run" to execute your code
5. **Save Projects** - Save your work and access it anytime
6. **Manage Projects** - View, edit, and delete projects from your dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Code Execution
- `POST /api/code/execute` - Execute code
- `GET /api/code/languages` - Get supported languages

## Supported Languages

- JavaScript (Node.js)
- Python 3
- Java
- C++
- PHP

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```

### Backend (Heroku/Railway)
```bash
cd server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details