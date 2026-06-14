const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { db, verifyToken } = require('../middleware/auth');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPTS = {
  coach: `You are ResumeBot, an expert resume coach helping students land jobs. Give specific, actionable advice to fix resume weaknesses. Help with: improving resume sections (summary, experience, skills, education), fixing weak language, adding strong action verbs, quantifying achievements, ATS compatibility. Keep responses concise (max 180 words). Use bullet points for lists. Give before/after examples when suggesting improvements. Be encouraging but honest. Always end with a follow-up question or next step.`,
  skills: `You are ResumeBot's Skill Gap Analyzer. Help students identify skills needed for their target job role. When a user mentions a role, provide: 1) Must-have technical skills, 2) Nice-to-have skills for competitive edge, 3) Overlooked soft skills, 4) Useful certifications or courses (both free and paid), 5) Rough time to learn each. Keep responses focused and practical (max 200 words). Mention free (YouTube, freeCodeCamp) and paid (Coursera, Udemy) resources, and certifications (Google, AWS, Microsoft) where helpful.`,
  projects: `You are ResumeBot's Project Advisor. Suggest specific, buildable portfolio projects to help students get hired. For each project: give it a concrete name and describe what it does, match difficulty to student level, explain why it impresses recruiters, list key technologies, give a time estimate, and suggest where to find starter resources (GitHub, freeCodeCamp, etc.). Suggest 2-3 projects per response. Keep each description under 70 words. Be concrete and actionable. Max 220 words total.`
};

router.post('/', verifyToken, async (req, res) => {
  try {
    const { messages, mode, conversationId } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' });

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.coach;

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const groqData = await groqRes.json();
    if (groqData.error) throw new Error(groqData.error.message);

    const reply = groqData.choices[0].message.content;

    // Save conversation to Firestore
    const convRef = db.collection('users').doc(req.user.uid)
      .collection('chatHistory');

    if (conversationId) {
      await convRef.doc(conversationId).update({
        messages: [...messages, { role: 'assistant', content: reply }],
        updatedAt: new Date().toISOString()
      });
      res.json({ reply, conversationId });
    } else {
      const newDoc = await convRef.add({
        mode,
        messages: [...messages, { role: 'assistant', content: reply }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      res.json({ reply, conversationId: newDoc.id });
    }

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get chat history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid)
      .collection('chatHistory')
      .orderBy('updatedAt', 'desc').limit(20).get();
    const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
