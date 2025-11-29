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
  const { emailId } = req.body;

  if (!emailId) {
    return res.status(400).json({ error: 'Email ID is required' });
  }

  try {
    // Mark email as read by removing the UNREAD label
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD'],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gmail mark read error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'Failed to mark email as read' });
    }

    const result = await response.json();
    res.json({ success: true, message: 'Email marked as read', result });

  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark email as read' });
  }
}
