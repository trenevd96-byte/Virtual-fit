// Diagnostic endpoint to check Vercel environment setup
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
        GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    };

    console.log('Diagnostics:', JSON.stringify(diagnostics, null, 2));
    return res.status(200).json(diagnostics);
  } catch (error) {
    console.error('Diagnostics error:', error);
    return res.status(500).json({ 
      error: 'Diagnostics failed',
      details: error.message 
    });
  }
};
