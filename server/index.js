import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createServer } from 'http';

dotenv.config();

const app = express();
app.use(cors('*'));
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dhruvgusai7600:Dhuli0991@cluster0.n5akw.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
   });
});


// Auth routes
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Email, password, and name are required'
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();
    
   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        details: 'Email and password are required'
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ 
        error: 'Invalid password',
        details: 'The provided password is incorrect'
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message
    });
  }
});






const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}



// Protect the roadmap generation route with authentication
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { career, experience, goals } = req.body;
    
    if (!career || !experience || !goals) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Career, experience, and goals are required'
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    };

    const prompt = `Generate a career roadmap in JSON format. The response should be valid JSON without any markdown or additional text.

For someone who wants to become a ${career}, with ${experience} experience level and the following goals: ${goals}

Required JSON structure:
{
  "title": "Career Roadmap for [Career]",
  "description": "A brief overview of the career path",
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed description of the step",
      "duration": "Estimated time to complete this step",
      "resources": ["Resource 1", "Resource 2"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('Raw Gemini response:', responseText);

    try {
      // Remove any potential markdown code block indicators
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '');
      const roadmapData = JSON.parse(cleanedResponse);
      
      // Validate the required structure
      if (!roadmapData.title || !roadmapData.description || !Array.isArray(roadmapData.steps)) {
        throw new Error('Response missing required fields');
      }
      
      res.json(roadmapData);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Response that failed to parse:', responseText);
      res.status(500).json({ 
        error: 'Invalid response format',
        details: 'The AI generated an invalid JSON response'
      });
    }
  } catch (error) {
    console.error('Error in generate-roadmap endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate roadmap',
      details: error.message
    });
  }
});

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const server = createServer();
  
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        server.close(() => resolve(port));
      });
      
      server.listen(port);
    };
    
    tryPort(startPort);
  });
};

// Start the server with automatic port finding
const startServer = async () => {
  try {
    const port = await findAvailablePort(3000);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      // Store the port in a file or environment variable if needed
      process.env.CURRENT_PORT = port;
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();