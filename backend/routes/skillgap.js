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
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Target role is required' });

    const resumeText = await extractTextFromPDF(req.file.buffer);

    const prompt = `You are a career coach. Analyse this resume against the target role. Respond ONLY with raw valid JSON. No markdown, no explanation, no text outside the JSON object.

Target role: "${role}"
Resume:
"""
${resumeText}
"""

Return this exact JSON:
{
  "verdict": "<2-3 sentence summary>",
  "readiness_pct": <integer 0-100>,
  "radar_categories": [
    { "category": "<name>", "current": <0-10>, "required": <0-10> },
    { "category": "<name>", "current": <0-10>, "required": <0-10> },
    { "category": "<name>", "current": <0-10>, "required": <0-10> },
    { "category": "<name>", "current": <0-10>, "required": <0-10> },
    { "category": "<name>", "current": <0-10>, "required": <0-10> },
    { "category": "<name>", "current": <0-10>, "required": <0-10> }
  ],
  "skills_have": ["<skill>","<skill>","<skill>","<skill>","<skill>","<skill>"],
  "skills_missing": ["<skill>","<skill>","<skill>","<skill>","<skill>"],
  "skills_to_learn": ["<skill>","<skill>","<skill>","<skill>","<skill>"],
  "learning_path": [
    {
      "skill": "<skill>",
      "priority": "High",
      "why": "<1 sentence>",
      "time_to_learn": "<e.g. 2 weeks>",
      "courses": [
        { "name": "<course name>", "platform": "YouTube", "type": "Free", "url": "https://youtube.com/results?search_query=<skill>" },
        { "name": "<course name>", "platform": "Coursera", "type": "Paid", "url": "https://coursera.org/search?query=<skill>" }
      ]
    },
    {
      "skill": "<skill>",
      "priority": "High",
      "why": "<1 sentence>",
      "time_to_learn": "<e.g. 1 month>",
      "courses": [
        { "name": "<course name>", "platform": "freeCodeCamp", "type": "Free", "url": "https://freecodecamp.org" },
        { "name": "<course name>", "platform": "Udemy", "type": "Paid", "url": "https://udemy.com/courses/search/?q=<skill>" }
      ]
    },
    {
      "skill": "<skill>",
      "priority": "Medium",
      "why": "<1 sentence>",
      "time_to_learn": "<e.g. 3 weeks>",
      "courses": [
        { "name": "<course name>", "platform": "Google", "type": "Certification", "url": "https://grow.google/certificates/" },
        { "name": "<course name>", "platform": "YouTube", "type": "Free", "url": "https://youtube.com/results?search_query=<skill>" }
      ]
    },
    {
      "skill": "<skill>",
      "priority": "Medium",
      "why": "<1 sentence>",
      "time_to_learn": "<e.g. 2 months>",
      "courses": [
        { "name": "<course name>", "platform": "AWS", "type": "Certification", "url": "https://aws.amazon.com/certification/" },
        { "name": "<course name>", "platform": "Coursera", "type": "Paid", "url": "https://coursera.org/search?query=<skill>" }
      ]
    },
    {
      "skill": "<skill>",
      "priority": "Low",
      "why": "<1 sentence>",
      "time_to_learn": "<e.g. 1 month>",
      "courses": [
        { "name": "<course name>", "platform": "Microsoft", "type": "Certification", "url": "https://learn.microsoft.com/en-us/certifications/" },
        { "name": "<course name>", "platform": "Udemy", "type": "Paid", "url": "https://udemy.com/courses/search/?q=<skill>" }
      ]
    }
  ],
  "projects": [
    {
      "title": "<project name>",
      "description": "<2 sentence description>",
      "difficulty": "Beginner",
      "time_estimate": "<e.g. 2-3 weekends>",
      "why_impressive": "<1 sentence>",
      "skills_used": ["<skill>","<skill>","<skill>"],
      "github_template": "<search term>"
    },
    {
      "title": "<project name>",
      "description": "<2 sentence description>",
      "difficulty": "Intermediate",
      "time_estimate": "<e.g. 1 week>",
      "why_impressive": "<1 sentence>",
      "skills_used": ["<skill>","<skill>","<skill>"],
      "github_template": "<search term>"
    },
    {
      "title": "<project name>",
      "description": "<2 sentence description>",
      "difficulty": "Intermediate",
      "time_estimate": "<e.g. 2 weeks>",
      "why_impressive": "<1 sentence>",
      "skills_used": ["<skill>","<skill>","<skill>"],
      "github_template": "<search term>"
    },
    {
      "title": "<project name>",
      "description": "<2 sentence description>",
      "difficulty": "Advanced",
      "time_estimate": "<e.g. 1 month>",
      "why_impressive": "<1 sentence>",
      "skills_used": ["<skill>","<skill>","<skill>"],
      "github_template": "<search term>"
    }
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
          { role: 'system', content: 'You are a skill gap analysis API. You respond ONLY with raw valid JSON. No markdown, no explanation, no text outside the JSON object.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2500,
        temperature: 0.1
      })
    });

    const groqData = await groqRes.json();
    if (groqData.error) throw new Error(groqData.error.message);

    const raw = groqData.choices[0].message.content;
    const result = extractJSON(raw);

    const docRef = await db.collection('users').doc(req.user.uid)
      .collection('skillGapAnalyses').add({
        role,
        ...result,
        fileName: req.file.originalname,
        createdAt: new Date().toISOString()
      });

    res.json({ id: docRef.id, role, ...result });

  } catch (err) {
    console.error('Skill gap error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', verifyToken, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid)
      .collection('skillGapAnalyses')
      .orderBy('createdAt', 'desc').limit(10).get();
    const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
