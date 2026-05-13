import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

function safeExtract(data) {
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.output ||
    data?.text ||
    null
  );
}

app.post('/api/runtime/gemini', async (req, res) => {

console.log('[RUNTIME REQUEST]', JSON.stringify(req.body, null, 2));

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY'
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' +
      process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    const safe = safeExtract(data);

    res.status(response.status).json({
      raw: data,
      response: safe || 'SYSTEM_FALLBACK_RESPONSE'
    });

  } catch (error) {
    res.status(500).json({
      error: String(error),
      response: 'SYSTEM_ERROR_FALLBACK'
    });
  }
});

app.listen(3030, () => {
  console.log('ICOS Runtime Proxy → http://localhost:3030');
});
