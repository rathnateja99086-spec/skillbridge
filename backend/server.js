require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://skillbridge-three-eosin.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/skillgap', require('./routes/skillgap'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Skill Bridge API running ✅' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
