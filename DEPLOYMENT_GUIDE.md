# CareHaven Deployment Guide

## Frontend Deployment

1. Choose a static host such as Netlify, Vercel, GitHub Pages, Firebase Hosting, or an Nginx server.
2. Deploy the folder `WebProject/donation-system`.
3. Set the backend API URL for the browser:

```javascript
localStorage.setItem('apiBaseUrl', 'https://api.your-domain.com/api');
```

For a production build, replace the hard-coded default in `WebProject/donation-system/js/auth.js` or inject it through your hosting environment.

4. Configure the frontend domain in backend `CORS_ORIGIN`.

## Backend Deployment

1. Create a Node.js service on Render, Railway, Fly.io, Heroku-compatible hosting, a VPS, or a container platform.
2. Set the root directory to `backend`.
3. Install dependencies:

```bash
npm install --omit=dev
```

4. Set environment variables from `backend/.env.example`.
5. Start the server:

```bash
npm start
```

6. Confirm health:

```bash
curl https://api.your-domain.com/api/health
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password.
3. Add the backend provider outbound IP to Network Access, or temporarily use `0.0.0.0/0` only during setup.
4. Copy the Node.js connection string.
5. Set `MONGODB_URI` on the backend host:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/carehaven
```

6. Restart the backend and test `/api/health`.

## Domain Connection

Frontend domain:

1. Add your custom domain in the static hosting provider.
2. Create the required DNS records, usually `A`, `AAAA`, or `CNAME`.
3. Enable HTTPS.

Backend API domain:

1. Add a subdomain such as `api.your-domain.com` in the backend host.
2. Create the DNS record provided by the backend host.
3. Enable HTTPS.
4. Set:

```env
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

5. Update frontend API base URL to `https://api.your-domain.com/api`.

## Production Checklist

- Use a unique `ADMIN_REGISTRATION_KEY`.
- Use a strong MongoDB password.
- Restrict MongoDB Atlas network access.
- Set `NODE_ENV=production`.
- Set exact `CORS_ORIGIN` values instead of allowing all origins.
- Use HTTPS for frontend and backend.
- Add uptime monitoring and log retention.
- Add database backups.
- Replace base64 report storage with object storage before high-volume usage.
- Add payment provider webhooks before accepting real money.
