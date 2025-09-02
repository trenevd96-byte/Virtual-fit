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
    console.log('Gemini API handler invoked at', new Date().toISOString());
    console.log('Request method:', req.method);
    console.log('Memory usage:', process.memoryUsage());
    
    const { endpoint, payload } = req.body || {};
    console.log('Request data:', { 
      endpoint: endpoint || 'missing',
      payloadSize: payload ? JSON.stringify(payload).length : 0,
      payloadKeys: payload ? Object.keys(payload) : []
    });
    
    if (!endpoint || !payload) {
      console.error('Missing endpoint or payload:', { endpoint: !!endpoint, payload: !!payload });
      return res.status(400).json({ error: 'Missing endpoint or payload' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API key status:', { 
      exists: !!apiKey, 
      length: apiKey ? apiKey.length : 0,
      prefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
    });
    
    if (!apiKey) {
      console.error('Gemini API key not found in environment');
      return res.status(500).json({ 
        error: 'API key not configured',
        hint: 'Set GEMINI_API_KEY in Vercel environment variables'
      });
    }

    console.log('Making request to:', `https://generativelanguage.googleapis.com/v1beta/${endpoint}`);

    const url = `https://generativelanguage.googleapis.com/v1beta/${endpoint}?key=${apiKey}`;

    // Set timeout for large image requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 seconds (under Vercel 60s limit)

    console.log('Starting fetch to Gemini API...');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const fetchTime = Date.now() - startTime;
    console.log('Fetch completed in', fetchTime, 'ms');
    console.log('Response status:', response.status);
    console.log('Memory after fetch:', process.memoryUsage());

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorData: errorData.substring(0, 500) // Truncate long errors
      });
      return res.status(response.status).json({ 
        error: errorData,
        fetchTime,
        status: response.status
      });
    }

    console.log('Parsing JSON response...');
    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log('Gemini API success:', {
      totalTime,
      responseSize: JSON.stringify(data).length,
      finalMemory: process.memoryUsage()
    });
    
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
