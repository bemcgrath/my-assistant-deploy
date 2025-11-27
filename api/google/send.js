export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const accessToken = authHeader.split(' ')[1];
  const { to, subject, body, threadId } = req.body;
  
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }
  
  try {
    // Create the email in RFC 2822 format
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ];
    
    const email = emailLines.join('\r\n');
    
    // Encode as base64url
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const requestBody = {
      raw: encodedEmail,
    };
    
    // If replying to a thread, include threadId
    if (threadId) {
      requestBody.threadId = threadId;
    }
    
    const response = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Gmail send error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'Failed to send email' });
    }
    
    const data = await response.json();
    
    res.json({ 
      success: true, 
      messageId: data.id,
      threadId: data.threadId,
    });
    
  } catch (err) {
    console.error('Gmail send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
