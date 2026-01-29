# Backend Deployment Guide

## ✅ Backend Rebuilt and Optimized for Vercel

The backend has been completely rebuilt and optimized for Vercel serverless deployment.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project (`acme-be`) → Settings → Environment Variables** and ensure these are set:

#### Required Variables:

```
DATABASE_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
```

**⚠️ CRITICAL:** 
- Replace `username` with your MongoDB username (e.g., `pasindu`)
- Replace `password` with your MongoDB password (URL-encode special characters if needed)
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster hostname (e.g., `cluster0.vcqkraa.mongodb.net`)
- Replace `database-name` with your database name (e.g., `acme-inventory`)
- **DO NOT use** `acme.whbausv.mongodb.net` - this is incorrect!

```
ACCESS_TOKEN_SECRET=your-very-long-random-string-at-least-32-characters
REFRESH_TOKEN_SECRET=another-very-long-random-string-different-from-above
```

**To generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this twice to get two different secrets.

### 2. MongoDB Atlas Configuration

1. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` to allow all IPs (or add Vercel's IP ranges)
   - Click "Add IP Address"

2. **Database User:**
   - Go to MongoDB Atlas → Database Access
   - Verify your database user exists
   - If password is unknown, reset it and update `DATABASE_URI` in Vercel

3. **Cluster Status:**
   - Ensure your cluster is running (not paused)
   - If paused, resume it from the Atlas dashboard

### 3. Verify Connection String

Your connection string should look like:
```
mongodb+srv://pasindu:yourpassword@cluster0.vcqkraa.mongodb.net/acme-inventory?retryWrites=true&w=majority
```

**Common Mistakes:**
- ❌ Wrong hostname: `acme.whbausv.mongodb.net`
- ✅ Correct hostname: `cluster0.vcqkraa.mongodb.net`
- ❌ Missing password encoding for special characters
- ❌ Missing database name

## 🚀 Deployment Steps

1. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Rebuild backend for Vercel deployment"
   git push origin main
   ```

2. **Vercel Auto-Deploy:**
   - Vercel will automatically detect the push and start deployment
   - Monitor the deployment in Vercel Dashboard

3. **Check Deployment Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Check "Build Logs" and "Function Logs" for any errors

## 🔍 Troubleshooting

### Error: `querySrv ENOTFOUND _mongodb._tcp.acme.whbausv.mongodb.net`

**Solution:** The `DATABASE_URI` in Vercel has the wrong hostname. Update it with the correct connection string from MongoDB Atlas.

### Error: `MongoServerError: bad auth : Authentication failed`

**Solution:** 
1. Check MongoDB Atlas → Database Access
2. Verify username and password
3. Reset password if needed
4. Update `DATABASE_URI` in Vercel

### Error: CORS Error

**Solution:** The backend CORS is configured for:
- `https://acme-fe-three.vercel.app`
- `http://localhost:5173`
- `http://localhost:3000`

If your frontend URL is different, update `ACME_BE/config/allowedOrigins.js`

### Error: `ACCESS_TOKEN_SECRET is not defined`

**Solution:** Add `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` to Vercel environment variables.

## 📝 Key Changes in Rebuild

1. ✅ Optimized middleware order for serverless
2. ✅ Improved database connection handling with caching
3. ✅ Enhanced CORS configuration
4. ✅ Better error handling with CORS headers
5. ✅ Clean code structure and organization
6. ✅ Proper serverless function export
7. ✅ Environment variable validation

## 🧪 Testing After Deployment

1. **Test Login:**
   ```bash
   curl -X POST https://acme-be.vercel.app/auth \
     -H "Content-Type: application/json" \
     -H "Origin: https://acme-fe-three.vercel.app" \
     -d '{"user":"your-username","pwd":"your-password"}'
   ```

2. **Test Protected Route:**
   ```bash
   curl https://acme-be.vercel.app/company/get-all-companies \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Origin: https://acme-fe-three.vercel.app"
   ```

## 📞 Support

If issues persist:
1. Check Vercel Function Logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas cluster is running
4. Check MongoDB Atlas Network Access settings
