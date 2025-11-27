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
    // Get today's start and end times
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const params = new URLSearchParams({
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '20',
    });
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Calendar API error:', error);
      return res.status(response.status).json({ error: error.error?.message || 'Failed to fetch calendar' });
    }
    
    const data = await response.json();
    
    // Transform events to a simpler format
    const events = (data.items || []).map(event => ({
      id: event.id,
      title: event.summary || '(No title)',
      description: event.description || '',
      location: event.location || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime,
      attendees: (event.attendees || []).map(a => a.email).join(', '),
      meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || '',
      status: event.status,
    }));
    
    res.json({ events });
    
  } catch (err) {
    console.error('Calendar fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
}
