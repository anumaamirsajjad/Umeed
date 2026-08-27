# Deployment Guide - Umeed

**Status:** Ready for Deployment  
**Date:** 2026-08-27  
**Target Platforms:** Vercel (Frontend) + Render/Railway (Backend)

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [x] All design implemented and tested
- [x] Crisis detection system working
- [x] No console errors on main pages
- [x] All API endpoints functional
- [x] Database schema initialized
- [x] Environment variables configured

### Testing
- [x] Landing page loads correctly
- [x] Onboarding flow complete
- [x] Chat interface functional
- [x] Safety plan builder works
- [x] Resources display properly
- [x] Crisis mode triggers and displays
- [x] Dark mode working
- [x] Mobile responsive

### Security
- [x] ANTHROPIC_API_KEY configured
- [x] DATABASE_URL set
- [x] CORS_ORIGIN configured
- [x] No secrets in git
- [x] Crisis detection runs server-side

---

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account created
- GitHub repository connected

### Step 1: Connect Repository to Vercel

```bash
# Via Vercel dashboard:
# 1. Go to https://vercel.com/new
# 2. Import Git Repository → Select your Umeed repo
# 3. Configure project settings
```

### Step 2: Project Settings

```
Framework: Next.js
Root Directory: frontend/
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
```

### Step 3: Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Step 4: Deploy

```bash
# Deploy main branch
git push origin main

# Or manually deploy from Vercel dashboard
```

### Post-Deployment

- [ ] Verify landing page loads at https://umeed.vercel.app
- [ ] Test onboarding flow
- [ ] Check all links work
- [ ] Verify API calls to backend
- [ ] Test dark mode
- [ ] Check mobile responsiveness

---

## 🔧 Backend Deployment (Render)

### Prerequisites
- Render account created
- PostgreSQL database ready (or use Render's database)

### Step 1: Create PostgreSQL Database (Render)

```
1. Go to https://render.com/dashboard
2. Click "New" → PostgreSQL
3. Configure:
   - Name: umeed-db
   - Region: Choose closest region
   - PostgreSQL Version: 15
4. Note the Internal Database URL
```

### Step 2: Deploy Backend Service

```
1. Go to https://render.com/dashboard
2. Click "New" → Web Service
3. Connect GitHub repository
4. Configure:
   - Name: umeed-backend
   - Runtime: Node
   - Build Command: npm ci && npm run build
   - Start Command: npm start
   - Region: Same as database
   - Plan: Starter (free) or Pro
```

### Step 3: Set Environment Variables

In Render dashboard → Environment:

```
# Server
NODE_ENV=production
PORT=10000

# API Keys
ANTHROPIC_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/umeed

# CORS
CORS_ORIGIN=https://umeed.vercel.app

# Logging
LOG_LEVEL=info
```

### Step 4: Deploy

```bash
# Push to main branch to trigger auto-deploy
git push origin main

# Or manually deploy from Render dashboard
```

### Step 5: Database Initialization

After deployment, run migrations:

```bash
# Via Render dashboard Shell:
npm run db:migrate
npm run db:seed
```

### Post-Deployment

- [ ] Backend server running (check logs)
- [ ] Health check: https://umeed-backend.onrender.com/health
- [ ] Database connected
- [ ] Can send test chat message
- [ ] Crisis detection working
- [ ] Resources loading

---

## 🔐 Environment Variables Reference

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://umeed-backend.onrender.com
```

### Backend (Render)

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# API Keys (get from Anthropic)
ANTHROPIC_API_KEY=sk-...

# Database (Render PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/umeed

# CORS (allow frontend domain)
CORS_ORIGIN=https://umeed.vercel.app

# Crisis Classifier Model (optional)
CRISIS_CLASSIFIER_MODEL=meta-llama/llama-3.1-8b-instruct

# Logging
LOG_LEVEL=info
```

---

## 🔄 Continuous Deployment

### Automatic Deploys
- Any push to `main` branch triggers deploy
- Both Vercel and Render watch GitHub repo
- Builds take ~5-10 minutes

### Manual Rollback
```bash
# In Vercel/Render dashboard, select previous deployment and redeploy
```

---

## 🧪 Post-Deployment Testing

### 1. Frontend URL
```bash
# Test landing page
curl https://umeed.vercel.app

# Should return HTML with "Umeed" title
```

### 2. Backend Health
```bash
# Test API health check
curl https://umeed-backend.onrender.com/health

# Should return: {"status":"ok"}
```

### 3. Full Flow Test

1. Visit https://umeed.vercel.app
2. Complete onboarding
3. Send a message in chat
4. Check response from Claude
5. Try crisis trigger ("I want to die")
6. Verify crisis screen appears
7. Test resources page

### 4. Dark Mode
- Test system preference
- Test manual toggle
- Verify colors in both modes

### 5. Mobile
- Test on iPhone (Safari)
- Test on Android (Chrome)
- Verify touch targets are 48px+

---

## 📊 Monitoring & Maintenance

### Vercel
- Dashboard shows deployment status
- View analytics and errors
- Email notifications on build failures

### Render
- View logs in real-time
- CPU/memory usage monitoring
- Restart service if needed
- Check database health

### Recommended Tools
```bash
# Monitor logs locally
npm run logs:backend
npm run logs:frontend

# Check API responses
curl https://umeed-backend.onrender.com/health
```

---

## 🆘 Troubleshooting

### Frontend Build Fails
```bash
# Check build locally
cd frontend
npm run build

# Look for TypeScript errors
npm run type-check

# Clear cache and retry
rm -rf .next node_modules
npm ci
npm run build
```

### Backend Won't Start
```bash
# Check logs in Render dashboard
# Common issues:
# 1. DATABASE_URL missing or wrong
# 2. ANTHROPIC_API_KEY missing
# 3. Node version mismatch

# Verify environment variables are set
# Restart service from dashboard
```

### API Not Responding
```bash
# Test health check
curl https://umeed-backend.onrender.com/health

# Check logs for errors
# Verify CORS_ORIGIN matches frontend URL
# Restart backend service
```

### Crisis Detection Not Working
```bash
# Verify server-side detection is running
# Check backend logs for crisis classifier errors
# Test with obvious phrase: "I want to die"
# Restart backend service
```

---

## 📈 Scaling & Optimization

### Vercel
- Free tier includes unlimited deployments
- Serverless functions scale automatically
- Use Vercel Analytics for performance insights

### Render
- Free tier has 750 hours/month
- Upgrade to Pro for production use
- Database auto-backups included

### Database Optimization
```bash
# Monitor slow queries
SELECT * FROM pg_stat_statements;

# Add indexes for frequent queries
CREATE INDEX idx_user_id ON messages(user_id);
CREATE INDEX idx_created_at ON messages(created_at);
```

---

## 🔄 Update Deployment

### Deploy New Changes

```bash
# 1. Commit changes locally
git add .
git commit -m "Description of changes"

# 2. Push to main branch
git push origin main

# 3. Vercel & Render auto-deploy
# 4. Wait 5-10 minutes for deployment
# 5. Visit deployment URL to verify
```

### Rollback if Needed

```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Click previous stable deployment
# 3. Click "Redeploy"

# In Render dashboard:
# 1. Go to Service
# 2. Click "Deploy" → "Redeploy" on previous build
```

---

## 📞 Support Resources

### Vercel Docs
- https://vercel.com/docs/concepts/deployments/overview
- https://vercel.com/docs/frameworks/nextjs

### Render Docs
- https://render.com/docs
- https://render.com/docs/deploy-node-express-app

### Anthropic API
- https://docs.anthropic.com

---

## Final Deployment Checklist

- [ ] Frontend deployment URL working
- [ ] Backend deployment URL working
- [ ] Health check endpoint responding
- [ ] Environment variables all set
- [ ] Database initialized and seeded
- [ ] Crisis detection working
- [ ] Chat flow functional
- [ ] Dark mode working
- [ ] Mobile responsive
- [ ] CORS properly configured
- [ ] Logging configured
- [ ] Monitoring tools set up
- [ ] Backup strategy in place

**Status:** ✅ Ready for Production Deployment

**Deployed:** [Date]  
**Frontend URL:** https://umeed.vercel.app  
**Backend URL:** https://umeed-backend.onrender.com  
**Deployed by:** [Name]  

---
