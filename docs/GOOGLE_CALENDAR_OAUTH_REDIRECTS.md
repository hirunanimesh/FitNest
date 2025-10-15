# Google Calendar OAuth Redirect URIs (UserService via API Gateway)

This project proxies the UserService through the API Gateway at `/api/user`. The calendar OAuth flow in `backend/UserService/services/calendar.service.js` uses the environment variable `BACKEND_URL` to build the Google OAuth `redirect_uri`.

Set `BACKEND_URL` to the API Gateway base path for the UserService. The code appends `/google/callback` to it automatically.

- redirect_uri = `${BACKEND_URL.replace(/\/+$/, '')}/google/callback`

## Local development
- BACKEND_URL: `http://localhost:3000/api/user`
- Google Cloud Console Authorized redirect URI to add:
  - `http://localhost:3000/api/user/google/callback`

## Production
- BACKEND_URL: `https://your-domain.com/api/user`
- Google Cloud Console Authorized redirect URI to add:
  - `https://your-domain.com/api/user/google/callback`

## Other required envs (UserService)
- GOOGLE_AUTH_URL: `https://accounts.google.com/o/oauth2/v2/auth`
- GOOGLE_TOKEN_URL: `https://oauth2.googleapis.com/token`
- GOOGLE_CLIENT_ID: `<your id>`
- GOOGLE_CLIENT_SECRET: `<your secret>`
- FRONTEND_URL: Frontend origin for post-auth redirect (e.g., `http://localhost:3010`)

## Why gateway path
The API Gateway mounts the user proxy at `/api/user` and rewrites it to the UserService. Hitting
`/api/user/google/callback` on the gateway forwards to `/google/callback` in UserService.

Checked files:
- Gateway: `backend/apigateway/index.js`, `src/proxies/userProxy.js`
- UserService routes: `backend/UserService/index.js`
- URL builder: `backend/UserService/services/calendar.service.js`
