module.exports = async function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Gemini API handler invoked');
    
    const { endpoint, payload } = req.body || {};
    if (!endpoint || !payload) {
      console.error('Missing endpoint or payload:', { endpoint: !!endpoint, payload: !!payload });
      return res.status(400).json({ error: 'Missing endpoint or payload' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found in environment');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Making request to:', `https://generativelanguage.googleapis.com/v1beta/${endpoint}`);

    const url = `https://generativelanguage.googleapis.com/v1beta/${endpoint}?key=${apiKey}`;

    // Set timeout for large image requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 seconds (under Vercel 60s limit)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    console.log('Gemini API success');
    return res.status(200).json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timeout');
      return res.status(408).json({ error: 'Request timeout' });
    }
    console.error('Error in Gemini API request:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
