export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh_token' });
  }
  
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      return res.status(400).json({ error: tokens.error });
    }
    
    res.json({
      access_token: tokens.access_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    });
    
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
}
