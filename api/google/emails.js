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
  
  const accessToken = authHeader.split(' ')[1];
  
  try {
    // Fetch recent emails from inbox
    const listParams = new URLSearchParams({
      maxResults: '20',
      labelIds: 'INBOX',
    });
    
    const listResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?${listParams}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!listResponse.ok) {
      const error = await listResponse.json();
      console.error('Gmail list error:', error);
      return res.status(listResponse.status).json({ error: error.error?.message || 'Failed to fetch emails' });
    }
    
    const listData = await listResponse.json();
    const messageIds = listData.messages || [];
    
    // Fetch details for each message (limit to 10 for performance)
    const emails = await Promise.all(
      messageIds.slice(0, 10).map(async ({ id }) => {
        const msgResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!msgResponse.ok) return null;
        
        const msg = await msgResponse.json();
        
        const getHeader = (name) => {
          const header = msg.payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase());
          return header?.value || '';
        };
        
        // Parse the From header to extract name and email
        const fromRaw = getHeader('From');
        const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/);
        const fromName = fromMatch ? fromMatch[1].replace(/"/g, '') : fromRaw;
        const fromEmail = fromMatch ? fromMatch[2] : fromRaw;
        
        // Get snippet (preview text)
        const snippet = msg.snippet || '';
        
        // Check if read
        const isRead = !msg.labelIds?.includes('UNREAD');
        
        // Check if important/starred
        const isImportant = msg.labelIds?.includes('IMPORTANT') || msg.labelIds?.includes('STARRED');
        
        // Format date
        const dateStr = getHeader('Date');
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const timeStr = isToday 
          ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return {
          id: msg.id,
          threadId: msg.threadId,
          from: fromName,
          fromEmail,
          subject: getHeader('Subject') || '(No subject)',
          preview: snippet,
          time: timeStr,
          read: isRead,
          priority: isImportant,
          labelIds: msg.labelIds || [],
        };
      })
    );
    
    res.json({ emails: emails.filter(Boolean) });
    
  } catch (err) {
    console.error('Gmail fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
}
