# Redis Options - Free vs Paid

This document explains different Redis hosting options for the WC Check v2 project.

## 🆓 FREE Options (Recommended)

### 1. Upstash Redis ⭐ (BEST for Production)

**Why Upstash?**
- ✅ Serverless & Edge-optimized
- ✅ Perfect for Next.js + Vercel
- ✅ Pay-per-request model
- ✅ Global edge locations
- ✅ No connection pooling needed

**Free Tier:**
- 10,000 commands per day
- 256 MB storage
- Enough for ~500 active users/day
- No credit card required

**Setup:**

1. **Sign up:** https://upstash.com
2. **Create Redis database** (select region closest to your Vercel region)
3. **Get credentials:**
   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```

4. **Install Upstash package:**
   ```bash
   npm install @upstash/redis
   ```

5. **Use Upstash client:**
   ```typescript
   // Already created: src/infrastructure/cache/redis-upstash.ts
   import { upstashCache } from '@/infrastructure/cache/redis-upstash';

   await upstashCache.setSession(sessionId, data);
   ```

6. **Update .env:**
   ```env
   # Option 1: Upstash (recommended for production)
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx

   # Option 2: Traditional Redis (development)
   # REDIS_HOST=localhost
   # REDIS_PORT=6379
   ```

---

### 2. Railway.app (Free $5 credit/month)

**Free Tier:**
- $5 credit per month
- Redis included
- Auto-scaling
- Easy deployment

**Setup:**
1. Sign up: https://railway.app
2. Deploy Redis template
3. Copy connection string
4. Add to .env:
   ```env
   REDIS_URL=redis://default:password@xxx.railway.app:6379
   ```

---

### 3. Redis Cloud (Redis Labs)

**Free Tier:**
- 30 MB storage
- Shared instances
- Good for development

**Setup:**
1. Sign up: https://redis.com/try-free
2. Create database
3. Get connection details
4. Add to .env

---

### 4. Self-Hosted (Docker)

**Perfect for Development:**

```bash
# Start Redis with Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Or with docker-compose
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
EOF

docker-compose up -d
```

**.env:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
# No password for local dev
```

---

## 💰 PAID Options (For Scale)

### 1. AWS ElastiCache
- **Price:** ~$15/month (t4g.micro)
- **Best for:** AWS-heavy infrastructure
- **Pros:** High availability, VPC integration
- **Cons:** Vendor lock-in

### 2. Google Cloud Memorystore
- **Price:** ~$20/month (basic tier)
- **Best for:** GCP users
- **Pros:** Managed service, auto-failover

### 3. Azure Cache for Redis
- **Price:** ~$15/month (basic)
- **Best for:** Azure ecosystem

### 4. Upstash Pro
- **Price:** Pay per request (~$0.20 per 100k requests)
- **Best for:** Variable traffic
- **Pros:** No minimum, scales automatically

---

## 📊 Comparison Table

| Provider | Free Tier | Price (Paid) | Best For | Setup Time |
|----------|-----------|--------------|----------|------------|
| **Upstash** ⭐ | 10K req/day | $0.20/100K | Production (Vercel) | 5 min |
| **Railway** | $5 credit/mo | Pay as you go | Hobby projects | 3 min |
| **Redis Cloud** | 30 MB | $7+/month | Small apps | 5 min |
| **Docker** | ✅ Unlimited | Server cost | Development | 1 min |
| **AWS** | ❌ | $15+/month | Enterprise | 30+ min |

---

## 🎯 Recommendations

### For Development:
```bash
# Use Docker (fastest setup)
docker run -d -p 6379:6379 redis:7-alpine
```

### For Production (Small-Medium):
```bash
# Upstash (recommended)
- Free tier: 10K commands/day
- Enough for 300-500 daily active users
- Serverless pricing
- Perfect for Vercel
```

### For Production (Large Scale):
```bash
# Upstash Pro or AWS ElastiCache
- Auto-scaling
- High availability
- Multi-region support
```

---

## 🔄 Switching Between Options

The project is configured to support both:

### Option 1: Traditional Redis (ioredis)
```typescript
// src/infrastructure/cache/redis.ts (current)
import { cacheService } from '@/infrastructure/cache/redis';
```

**Environment:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional
REDIS_DB=0
```

### Option 2: Upstash Redis
```typescript
// src/infrastructure/cache/redis-upstash.ts (new)
import { upstashCache } from '@/infrastructure/cache/redis-upstash';
```

**Environment:**
```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## 🚀 Quick Start (Choose One)

### Development (Docker):
```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. No additional setup needed
npm run dev
```

### Production (Upstash):
```bash
# 1. Install Upstash package
npm install @upstash/redis

# 2. Sign up at upstash.com and create database

# 3. Update .env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# 4. Update imports (if switching from ioredis)
# Replace: import { cacheService } from '@/infrastructure/cache/redis'
# With: import { upstashCache as cacheService } from '@/infrastructure/cache/redis-upstash'

# 5. Deploy to Vercel
vercel --prod
```

---

## 💡 Cost Estimation

### WC Check v2 Usage (estimated):
- **Users:** 100 active users/day
- **Sessions:** 100 sessions × 3 requests = 300 req/day
- **Cache reads:** 1000 req/day
- **Total:** ~1,500 req/day

### Fits in Free Tier:
- ✅ Upstash: 10,000 req/day (6.6x headroom)
- ✅ Railway: $5 credit (~15,000 requests)
- ⚠️ Redis Cloud: Limited by 30 MB storage

**Conclusion:** Free tier is MORE than enough for this project! 🎉

---

## ❓ FAQ

### Q: Can I use Redis for free in production?
**A:** Yes! Upstash free tier gives you 10,000 commands/day, which is perfect for small-medium apps.

### Q: What happens if I exceed free tier?
**A:**
- Upstash: Automatically upgraded to pay-per-request ($0.20/100K)
- Railway: Uses your $5 credit, then pauses
- Redis Cloud: Service may be suspended

### Q: Which is best for Vercel deployment?
**A:** Upstash, hands down. It's serverless and edge-optimized for Next.js.

### Q: Do I need to change code to switch providers?
**A:** Minimal changes. The cache service interface is the same, just change the import and environment variables.

### Q: Can I start with Docker and switch to Upstash later?
**A:** Absolutely! Start local, deploy to Upstash when ready.

---

## 📞 Support

- Upstash Discord: https://upstash.com/discord
- Railway Discord: https://discord.gg/railway
- Redis Community: https://redis.io/community

---

**TL;DR:**
✅ Use **Docker** for development (free, local)
✅ Use **Upstash** for production (free tier: 10K req/day)
✅ Scale to **Upstash Pro** when needed (pay per use)
✅ **No monthly costs** for most small-medium apps!
