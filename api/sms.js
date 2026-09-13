export default async function handler(req, res) {
  // CORS Headers (Cross-origin allow karne ke liye)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: false, 
      error: 'Method not allowed. Use GET request!' 
    });
  }

  const { key, number, count, msg } = req.query;

  // --- MULTI-KEY SYSTEM ---
  // Aap Vercel Environment Variables me 'API_KEYS' set kar sakte ho (comma separated, e.g., bunny,secret123,devkey)
  // Agar env variable nahi mila toh ye default keys use karega.
  const defaultKeys = ['bunny', 'codex-bunny'];
  const allowedKeys = process.env.API_KEYS 
    ? process.env.API_KEYS.split(',').map(k => k.trim()) 
    : defaultKeys;

  // Key Validation
  if (!key || !allowedKeys.includes(key)) {
    return res.status(401).json({ 
      status: false, 
      error: 'Unauthorized: Invalid or missing API Key! Contact Admin.' 
    });
  }

  // Parameter Validation
  if (!number || !count || !msg) {
    return res.status(400).json({ 
      status: false, 
      error: 'Missing required parameters! Required: number, count, msg' 
    });
  }

  try {
    // Target API URL construction with proper encoding
    const targetUrl = `https://custom-sms-theta.vercel.app/send-msg?number=${encodeURIComponent(number)}&count=${encodeURIComponent(count)}&msg=${encodeURIComponent(msg)}`;

    // Target API ko request bhejna (Node.js native fetch)
    const apiResponse = await fetch(targetUrl);
    const responseData = await apiResponse.json();

    // Success Response Return karna
    return res.status(200).json({
      status: true,
      author: "TH3 BUNNY",
      target_response: responseData
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ 
      status: false, 
      error: 'Internal Server Error while connecting to target API',
      details: error.message 
    });
  }
}
