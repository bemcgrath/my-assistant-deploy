export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing email id' });
  }
  
  const accessToken = authHeader.split(' ')[1];
  
  try {
    // Fetch the full email
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Gmail fetch error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'Failed to fetch email' });
    }
    
    const msg = await response.json();
    
    // Helper to get headers
    const getHeader = (name) => {
      const header = msg.payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };
    
    // Parse the From header
    const fromRaw = getHeader('From');
    const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
    const fromName = fromMatch ? fromMatch[1].replace(/"/g, '') : fromRaw;
    const fromEmail = fromMatch ? fromMatch[2] : fromRaw;
    
    // Get email body
    let body = '';
    let htmlBody = '';
    
    const getBody = (payload) => {
      if (payload.body?.data) {
        const decoded = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        if (payload.mimeType === 'text/html') {
          htmlBody = decoded;
        } else if (payload.mimeType === 'text/plain') {
          body = decoded;
        }
      }
      
      if (payload.parts) {
        for (const part of payload.parts) {
          getBody(part);
        }
      }
    };
    
    getBody(msg.payload);
    
    // Prefer HTML body, fall back to plain text
    const emailBody = htmlBody || body || msg.snippet || '';
    
    // Format date
    const dateStr = getHeader('Date');
    const date = new Date(dateStr);
    
    const email = {
      id: msg.id,
      threadId: msg.threadId,
      from: fromName,
      fromEmail,
      to: getHeader('To'),
      subject: getHeader('Subject') || '(No subject)',
      date: date.toLocaleString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      body: emailBody,
      isHtml: !!htmlBody,
      labelIds: msg.labelIds || [],
    };
    
    res.json({ email });
    
  } catch (err) {
    console.error('Email fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
}
