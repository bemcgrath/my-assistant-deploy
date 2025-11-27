export default async function handler(req, res) {
  const { code, error } = req.query;
  
  if (error) {
    return res.redirect('/?auth_error=' + encodeURIComponent(error));
  }
  
  if (!code) {
    return res.redirect('/?auth_error=no_code');
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      console.error('Token error:', tokens);
      return res.redirect('/?auth_error=' + encodeURIComponent(tokens.error));
    }
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    const user = await userResponse.json();
    
    // Create a simple encrypted token to store in the browser
    // In production, you'd want to use proper session management
    const authData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
    
    // Encode auth data as base64 to pass to frontend
    const encodedAuth = Buffer.from(JSON.stringify(authData)).toString('base64');
    
    // Redirect back to app with auth data
    res.redirect('/?auth_success=' + encodeURIComponent(encodedAuth));
    
  } catch (err) {
    console.error('Auth callback error:', err);
    res.redirect('/?auth_error=server_error');
  }
}
