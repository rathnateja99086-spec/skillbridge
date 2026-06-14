const express = require('express');
const router = express.Router();
const multer = require('multer');
const fetch = require('node-fetch');
const { extractTextFromPDF } = require('../utils/pdfExtract');
const { extractJSON } = require('../utils/parseJSON');
const { db, verifyToken } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

router.post('/', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const resumeText = await extractTextFromPDF(req.file.buffer);

    const prompt = `You are an expert resume reviewer. Analyze this resume and respond ONLY with valid JSON. No markdown, no explanation, no extra text before or after. Just the raw JSON object.

Resume:
"""
${resumeText}
"""

Return this exact JSON:
{
  "score": <integer 0-100>,
  "grade": "<A+|A|B+|B|C+|C|D>",
  "title": "<short verdict e.g. Strong Resume or Needs Work>",
  "verdict": "<2-3 sentence overall assessment>",
  "sections": {
    "Contact Info": <integer 0-100>,
    "Summary": <integer 0-100>,
    "Experience": <integer 0-100>,
    "Skills": <integer 0-100>,
    "Education": <integer 0-100>,
    "Formatting": <integer 0-100>
  },
  "pros": ["<strength 1>","<strength 2>","<strength 3>","<strength 4>"],
  "cons": ["<weakness 1>","<weakness 2>","<weakness 3>","<weakness 4>"],
  "suggestions": [
    {"title":"<fix title>","detail":"<actionable advice>"},
    {"title":"<fix title>","detail":"<actionable advice>"},
    {"title":"<fix title>","detail":"<actionable advice>"},
    {"title":"<fix title>","detail":"<actionable advice>"},
    {"title":"<fix title>","detail":"<actionable advice>"}
  ]
}`;

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a resume analysis API. You respond ONLY with raw valid JSON. No markdown, no explanation, no text outside the JSON object.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })
    });

    const groqData = await groqRes.json();
    if (groqData.error) throw new Error(groqData.error.message);

    const raw = groqData.choices[0].message.content;
    const result = extractJSON(raw);

    // Save to Firestore
    const docRef = await db.collection('users').doc(req.user.uid)
      .collection('resumeScores').add({
        ...result,
        fileName: req.file.originalname,
        createdAt: new Date().toISOString()
      });

    res.json({ id: docRef.id, ...result });

  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid)
      .collection('resumeScores')
      .orderBy('createdAt', 'desc').limit(10).get();
    const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
