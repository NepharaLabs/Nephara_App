 # Common Issues

This guide covers the most common problems and their solutions.

## Installation Issues

### Error: "Module not found"

**Symptom**:

```
Error: Cannot find module 'framer-motion'
Module not found: Can't resolve '@ai-sdk/google'
```

**Cause**: Missing dependencies or corrupted node_modules

**Solution**:

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

### Error: "Node version not supported"

**Symptom**:

```
error: The engine "node" is incompatible with this module
```

**Cause**: Node.js version is too old

**Solution**:

```bash
# Check your version
node --version

# Install Node.js 18.17+ from nodejs.org
# Or use nvm:
nvm install 18
nvm use 18

# Reinstall and run
npm install
npm run dev
```

### Error: "Port 3000 already in use"

**Symptom**:

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause**: Another process is using port 3000

**Solution 1 - Use different port**:

```bash
npm run dev -- -p 3001
```

**Solution 2 - Kill the process (macOS/Linux)**:

```bash
lsof -ti:3000 | xargs kill
```

**Solution 3 - Kill the process (Windows)**:

```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

## API & Environment Issues

### Error: "API key not configured"

**Symptom**:

- Chat doesn't work
- Console shows API key errors
- Blank responses

**Solution**:

1. **Create `.env.local` in root directory**:

```bash
touch .env.local
```

2. **Add your API key**:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

3. **Verify the variable name** is exactly as shown (common typo)

4. **No quotes** around the value

5. **Restart the dev server**:

```bash
# Stop with Ctrl+C, then:
npm run dev
```

6. **Check file location** - must be in root, not in `app/` folder

### Error: "API request failed"

**Symptom**:

```
Failed to fetch
Network error
429 Too Many Requests
```

**Causes & Solutions**:

**1. Invalid API key**:

- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Verify key is active
- Generate new key if needed
- Update `.env.local`

**2. Rate limit exceeded**:

- Google AI free tier has limits
- Wait 1 minute and try again
- Consider upgrading API tier

**3. Network issues**:

- Check internet connection
- Disable VPN temporarily
- Check firewall settings

**4. API service down**:

- Check [Google AI status](https://status.google.com/)
- Try again later

### Environment variables not loading

**Symptom**: Variables work locally but not in production

**Solution for Vercel**:

1. Go to Project → Settings → Environment Variables
2. Add `GOOGLE_GENERATIVE_AI_API_KEY`
3. Select all environments (Production, Preview, Development)
4. Redeploy the project

**Solution for local**:

1. Verify file is named `.env.local` exactly
2. Restart dev server after changes
3. Check `.gitignore` includes `.env.local`

## Build Issues

### Error: "Build failed"

**Symptom**:

```
npm run build
Error: Build failed with X errors
```

**Common causes**:

**1. Syntax errors**:

```bash
# Check for missing brackets, quotes, etc.
npm run lint
```

**2. Import errors**:

```javascript
// ❌ Wrong
import { Component } from 'wrong-path';

// ✅ Correct
import { Component } from './correct-path';
```

**3. Type errors** (if using TypeScript):

```bash
# Fix type issues or add @ts-ignore
```

**4. Environment variables**:

```bash
# Ensure all required env vars exist in build environment
```

**General solution**:

```bash
# Clean build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

### Error: "Tailwind CSS not working"

**Symptom**:

- No styles applied
- Plain HTML appearance
- Missing colors

**Solution**:

1. **Verify Tailwind installation**:

```bash
npm install -D tailwindcss@^4 @tailwindcss/postcss@^4
```

2. **Check `globals.css`** has:

```css
@import 'tailwindcss';
```

3. **Verify import** in `layout.js`:

```javascript
import './globals.css';
```

4. **Clear cache and rebuild**:

```bash
rm -rf .next
npm run dev
```

## Runtime Issues

### Cooldown doesn't work

**Symptom**: Can send multiple messages without waiting

**Solution**:

1. **Check browser console** for JavaScript errors

2. **Verify localStorage is enabled**:

```javascript
// Test in browser console
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should show 'value'
```

3. **Clear localStorage**:

```javascript
// In browser console
localStorage.clear();
```

4. **Refresh the page** and try again

### Cooldown stuck at 50 seconds

**Symptom**: Countdown never decreases

**Solution**:

1. **Check browser console** for errors

2. **Clear localStorage**:

```javascript
localStorage.removeItem('lastSubmitTime');
```

3. **Refresh the page**

4. **Check useEffect** is working:

```javascript
// Should see countdown decrease every second
console.log('Cooldown:', cooldownRemaining);
```

### Messages not displaying

**Symptom**:

- Send message but nothing appears
- Blank chat area
- No error messages

**Solution**:

1. **Check browser console** for errors

2. **Verify API is responding**:

```bash
# Test endpoint manually
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

3. **Check network tab** in DevTools:

- Is request being sent?
- What's the response status?
- Any errors?

4. **Verify `useChat` hook** is working:

```javascript
console.log('Messages:', messages);
console.log('Status:', status);
```

### Streaming responses are slow

**Symptom**: AI takes 30+ seconds to respond

**Causes & Solutions**:

**1. Web search is slow** (expected):

- Searches take 5-15 seconds
- This is normal for real-time data
- Consider reducing search requirements

**2. Large max tokens**:

```javascript
// Reduce from 4000 to 2000
maxTokens: 2000;
```

**3. Network latency**:

- Check internet speed
- Try different network
- Disable VPN

**4. Google AI API slow**:

- Try at different time
- Check API status
- Consider different region

## UI Issues

### Matrix rain causing lag

**Symptom**: Animations are choppy, page is slow

**Solution 1 - Disable on mobile**:

```javascript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);

{
  !isMobile && <MatrixRain />;
}
```

**Solution 2 - Reduce complexity**:

```javascript
// In MatrixRain.js
// Reduce number of columns
const columnCount = Math.floor(canvas.width / 10); // Increase 10 to 20
```

**Solution 3 - Remove completely**:

```javascript
// Comment out in page.js
// <MatrixRain />
```

### Styles not updating

**Symptom**: CSS changes don't appear

**Solution**:

1. **Hard refresh browser**:
   - Chrome/Firefox: Ctrl+Shift+R (Cmd+Shift+R on Mac)
   - Safari: Cmd+Option+R

2. **Clear .next folder**:

```bash
rm -rf .next
npm run dev
```

3. **Check Tailwind classes** are correct:

```jsx
// ✅ Correct
className = 'bg-black text-white';

// ❌ Wrong (custom CSS needed)
className = 'custom-style';
```

### Icons not showing

**Symptom**: Square boxes instead of icons

**Solution**:

1. **Verify lucide-react is installed**:

```bash
npm install lucide-react
```

2. **Check import**:

```javascript
import { Eye, Send, Loader2 } from 'lucide-react';
```

3. **Clear cache and reinstall**:

```bash
rm -rf node_modules .next
npm install
npm run dev
```

## Deployment Issues

### Vercel build fails

**Symptom**: Deployment fails with build errors

**Solution**:

1. **Test build locally first**:

```bash
npm run build
```

2. **Check build logs** in Vercel Dashboard

3. **Verify environment variables** are added

4. **Ensure Node version** matches:

```json
// package.json
{
  "engines": {
    "node": ">=18.17.0"
  }
}
```

5. **Check for ESLint errors**:

```bash
npm run lint
```

### Function timeout on Vercel

**Symptom**:

```
Error: Function exceeded maximum duration of 10s
```

**Cause**: Vercel Hobby plan has 10-second limit

**Solutions**:

**Option 1 - Upgrade to Pro** ($20/month):

- 60-second limit
- Better support
- More resources

**Option 2 - Reduce timeout**:

```javascript
// app/api/chat/route.js
export const maxDuration = 10; // Down from 50
```

Then adjust cooldown in `app/app/page.js` to match.

**Option 3 - Use different host**:

- Railway
- Render
- Self-hosted

### Domain not working

**Symptom**: Custom domain doesn't load

**Solution**:

1. **Wait 24-48 hours** for DNS propagation

2. **Verify DNS records**:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

3. **Check DNS propagation**:

- Visit [whatsmydns.net](https://www.whatsmydns.net/)
- Enter your domain
- Check if records are propagating

4. **Verify in Vercel Dashboard**:

- Settings → Domains
- Check for error messages
- SSL certificate status

## Performance Issues

### Page loads slowly

**Optimization checklist**:

1. **Optimize images**:

```javascript
// Use Next.js Image component
import Image from 'next/image';
<Image src="/logo.png" width={100} height={100} />;
```

2. **Reduce animations**:

```javascript
// Disable or simplify animations
transition={{ duration: 0.2 }} // Reduce from 0.5
```

3. **Code splitting**:

```javascript
// Lazy load components
const MatrixRain = dynamic(() => import('./components/MatrixRain'), {
  ssr: false,
});
```

4. **Analyze bundle**:

```bash
npm run build
# Check .next/analyze for bundle size
```

### High API costs

**Symptom**: Google AI bill is high

**Solutions**:

1. **Reduce max tokens**:

```javascript
maxTokens: 2000; // Down from 4000
```

2. **Implement caching**:

```javascript
// Cache common queries
const cache = new Map();
```

3. **Increase cooldown**:

```javascript
// 60 seconds instead of 50
if (timeSinceLastSubmit < 60) { ... }
```

4. **Monitor usage**:

- Check Google AI Studio quota
- Set up billing alerts
- Track usage per day

## Getting More Help

If your issue isn't listed here:

1. **Check the logs**:
   - Browser console
   - Terminal output
   - Vercel logs (if deployed)

2. **Search GitHub Issues**:
   - [Existing issues](https://github.com/yourusername/NEPHARA/issues)
   - Someone may have solved it

3. **Ask for help**:
   - [Open an issue](https://github.com/yourusername/NEPHARA/issues/new)
   - Include error messages and logs

4. **Read related docs**:
   - [FAQ](../appendix/faq.md)
   - [API Reference](../api-reference/chat.md)
   - [Configuration](../getting-started/configuration.md)

---

**Still stuck?** [Open an issue](https://github.com/yourusername/NEPHARA/issues) with detailed information and we'll help you out!



