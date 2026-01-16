import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// FIX 1: You cannot use "await" at top-level unless file type is module
// Your package.json already has: "type": "module"
// So this is allowed. Keep it.
await connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Test route
app.get('/', (req, res) => res.send('server is Live!'));

// Apply auth middleware BEFORE protected routes (CORRECT)
app.use(requireAuth());

// API Routes
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
