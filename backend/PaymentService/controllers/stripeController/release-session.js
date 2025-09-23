import { URL } from 'url';

const TRAINER_SERVICE_URL = process.env.TRAINER_SERVICE_URL || 'http://localhost:3005';

export default async function releaseSessionHandler(req, res) {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = parsedUrl.searchParams.get('sessionId');
    const redirect = parsedUrl.searchParams.get('redirect');

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Release the hold on the session
    try {
      await fetch(`${TRAINER_SERVICE_URL}/releasesession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (e) {
      // Log and continue to redirect
      console.error('Error releasing session on cancel:', e);
    }

    // Redirect back to the provided URL or fallback
    const target = redirect || process.env.DOMAIN || 'http://localhost:3000';
    res.writeHead(302, { Location: target });
    return res.end();
  } catch (err) {
    console.error('Cancel handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
