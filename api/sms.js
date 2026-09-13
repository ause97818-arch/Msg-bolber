export default async function handler(req, res) {
  // CORS Headers (Cross-origin allow karne ke liye)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Pretty Print (JSON response formatted with indentation)
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    return res.status(405).send(JSON.stringify({ 
      status: false, 
      error: 'Method not allowed. Use GET request!' 
    }, null, 4));
  }

  const { key, number, count, msg } = req.query;

  // --- MULTI-KEY SYSTEM ---
  // Updated default keys: bunny03, rabbit, codex-bunny
  const defaultKeys = ['bunny03', 'rabbit', 'codex-bunny'];
  const allowedKeys = process.env.API_KEYS 
    ? process.env.API_KEYS.split(',').map(k => k.trim()) 
    : defaultKeys;

  // Key Validation
  if (!key || !allowedKeys.includes(key)) {
    return res.status(401).send(JSON.stringify({ 
      status: false, 
      error: 'Unauthorized: Invalid or missing API Key! Contact Admin.' 
    }, null, 4));
  }

  // Parameter Validation
  if (!number || !count || !msg) {
    return res.status(400).send(JSON.stringify({ 
      status: false, 
      error: 'Missing required parameters! Required: number, count, msg' 
    }, null, 4));
  }

  try {
    // Target API URL construction with proper encoding
    const targetUrl = `https://custom-sms-theta.vercel.app/send-msg?number=${encodeURIComponent(number)}&count=${encodeURIComponent(count)}&msg=${encodeURIComponent(msg)}`;

    // Target API ko request bhejna
    const apiResponse = await fetch(targetUrl);
    let responseData = await apiResponse.json();

    // --- RESPONSES MODIFICATION ---
    // 1. 'channel' ko remove/delete karna
    delete responseData.channel;

    // 2. 'owner' aur 'developer' ko update karna
    responseData.owner = "@th3bunny";
    responseData.developer = "Somnath Mahanta";

    // Final Pretty Printed Success Response (JSON.stringify with 4 spaces indentation)
    const finalResponse = {
      status: true,
      author: "TH3 BUNNY",
      target_response: responseData
    };

    return res.status(200).send(JSON.stringify(finalResponse, null, 4));

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).send(JSON.stringify({ 
      status: false, 
      error: 'Internal Server Error while connecting to target API',
      details: error.message 
    }, null, 4));
  }
}
