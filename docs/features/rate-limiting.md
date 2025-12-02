# Rate Limiting

Luna402 implements a robust rate limiting system to prevent abuse and ensure fair usage across all users.

## Overview

The rate limiting system enforces a **50-second cooldown** between messages, with protection against bypass attempts through page refreshes.

## How It Works

### Client-Side Implementation

The rate limit is enforced in the chat interface (`app/app/page.js`):

```javascript
const [cooldownRemaining, setCooldownRemaining] = useState(0);
const [lastSubmitTime, setLastSubmitTime] = useState(0);

const handleFormSubmit = (e) => {
  e.preventDefault();
  const now = Date.now();
  const timeSinceLastSubmit = (now - lastSubmitTime) / 1000;

  if (timeSinceLastSubmit < 50 && lastSubmitTime > 0) {
    const remaining = Math.ceil(50 - timeSinceLastSubmit);
    setCooldownRemaining(remaining);
    return;
  }

  // Allow submission
  setLastSubmitTime(now);
  setCooldownRemaining(50);
  localStorage.setItem('lastSubmitTime', now.toString());

  sendMessage({ text: finalMessage });
};
```

### Countdown Timer

A live countdown displays the remaining time:

```javascript
useEffect(() => {
  if (cooldownRemaining > 0) {
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        const newValue = Math.max(0, prev - 1);
        if (newValue === 0) {
          localStorage.removeItem('lastSubmitTime');
        }
        return newValue;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [cooldownRemaining]);
```

### Refresh Protection

The cooldown persists across page refreshes using localStorage:

```javascript
useEffect(() => {
  const storedTime = localStorage.getItem('lastSubmitTime');
  if (storedTime) {
    const lastTime = parseInt(storedTime, 10);
    const now = Date.now();
    const timeSinceLastSubmit = (now - lastTime) / 1000;

    if (timeSinceLastSubmit < 50) {
      const remaining = Math.ceil(50 - timeSinceLastSubmit);
      setLastSubmitTime(lastTime);
      setCooldownRemaining(remaining);
    } else {
      localStorage.removeItem('lastSubmitTime');
    }
  }
}, []);
```

## User Experience

### Before Cooldown

- ✅ Input fields are enabled
- ✅ Send button shows send icon
- ✅ User can type and submit messages

### During Cooldown

- ❌ Input fields are disabled
- ⏱️ Send button shows countdown (e.g., "47s")
- 📝 Message displays: "Please wait X seconds before sending another message"
- 🔒 Cannot bypass by refreshing page

### After Cooldown

- ✅ Input fields re-enable automatically
- ✅ Send button returns to normal
- ✅ User can submit new messages

## Visual Indicators

### Send Button States

```jsx
<button type="submit" disabled={isLoading || !input.trim() || cooldownRemaining > 0}>
  {isLoading ? (
    <Loader2 className="h-5 w-5 animate-spin" />
  ) : cooldownRemaining > 0 ? (
    <span>{cooldownRemaining}s</span>
  ) : (
    <Send className="h-5 w-5" />
  )}
</button>
```

### Input Field States

```jsx
<input disabled={isLoading || cooldownRemaining > 0} placeholder="Ask about a token..." />
```

### Status Message

```jsx
{
  cooldownRemaining > 0 ? (
    <span className="text-[#0f9d58]">
      There is currently high traffic. Please wait {cooldownRemaining} seconds before sending
      another message.
    </span>
  ) : (
    'Luna402 provides AI-generated insights. Always do your own research.'
  );
}
```

## Configuration

### Changing the Cooldown Duration

To modify the 50-second cooldown, update these locations in `app/app/page.js`:

1. **Line 43-46**: Cooldown check

```javascript
if (timeSinceLastSubmit < 50 && lastSubmitTime > 0) {
  const remaining = Math.ceil(50 - timeSinceLastSubmit);
  // Change both 50s
}
```

2. **Line 58**: Initial cooldown setting

```javascript
setCooldownRemaining(50); // Change this
```

3. **Line 46-49**: Restoration check

```javascript
if (timeSinceLastSubmit < 50) {
  const remaining = Math.ceil(50 - timeSinceLastSubmit);
  // Change both 50s
}
```

**Example: Change to 30 seconds**

Replace all instances of `50` with `30`.

### Server-Side Alignment

The API route has a matching timeout in `app/api/chat/route.js`:

```javascript
export const maxDuration = 50;
```

This should match or exceed your cooldown duration.

## Implementation Details

### localStorage Schema

**Key**: `lastSubmitTime`

**Value**: Timestamp in milliseconds (string)

**Example**:

```
"1734567890123"
```

### Cleanup Strategy

localStorage is cleaned up:

1. When cooldown reaches 0
2. When expired timestamp is detected on mount
3. Never accumulates stale data

### Security Considerations

#### Cannot Be Bypassed By:

✅ **Refreshing the page** - Timestamp persists in localStorage
✅ **Opening new tab** - Same localStorage across tabs
✅ **Developer tools** - Client-side only, expected behavior
✅ **Clearing input** - Cooldown tracks time, not input

#### Can Be Bypassed By:

⚠️ **Clearing localStorage** - Expected; user's choice
⚠️ **Private/Incognito mode** - Different storage context
⚠️ **Different browser** - Separate storage

### Why Client-Side Only?

1. **Simplicity**: No backend state management needed
2. **Scalability**: No database or session storage required
3. **Privacy**: No tracking of user behavior
4. **Fair usage**: Prevents accidental spam, not malicious abuse

For production systems requiring stronger enforcement, consider:

- Session-based rate limiting
- IP-based rate limiting
- Authentication-based quotas

## Best Practices

### For Users

1. **Wait patiently** - The AI needs time to perform web searches
2. **Craft detailed questions** - Make each query count
3. **Use follow-ups wisely** - Build on previous context

### For Developers

1. **Match server timeout** - Keep `maxDuration` >= cooldown
2. **Test edge cases** - Verify refresh protection works
3. **Communicate clearly** - User message explains the wait
4. **Consider UX** - Show countdown for transparency

## Troubleshooting

### Cooldown Not Working

**Symptoms**: Can send multiple messages immediately

**Solutions**:

1. Check browser console for JavaScript errors
2. Verify localStorage is enabled
3. Ensure useEffect hooks are running
4. Check that state updates are occurring

### Cooldown Stuck

**Symptoms**: Countdown never reaches 0

**Solutions**:

1. Refresh the page
2. Clear localStorage manually:
   ```javascript
   localStorage.removeItem('lastSubmitTime');
   ```
3. Check interval cleanup in useEffect

### Cooldown Resets on Refresh

**Symptoms**: Refresh bypasses cooldown

**Solutions**:

1. Verify localStorage restoration useEffect exists
2. Check that 'lastSubmitTime' is being stored
3. Ensure parseInt is parsing correctly

## Alternative Approaches

### Session-Based

```javascript
// Would require API session management
const session = await getSession();
if (session.lastMessageTime + 50000 > Date.now()) {
  return { error: 'Rate limited' };
}
```

**Pros**: Server-enforced, more secure
**Cons**: Requires backend state, less scalable

### Token Bucket

```javascript
// Would require more complex implementation
const tokens = getUserTokens();
if (tokens > 0) {
  consumeToken();
  processMessage();
}
```

**Pros**: Allows bursts, more flexible
**Cons**: Complex implementation, needs backend

## Future Enhancements

Potential improvements:

1. **Variable cooldowns** - Shorter for simple queries, longer for complex
2. **User accounts** - Track quotas per user
3. **Premium tiers** - Reduced/no cooldown for paid users
4. **Adaptive limiting** - Adjust based on system load

## Related Documentation

- [Security Features](security.md)
- [Chat API](../api-reference/chat.md)
- [State Management](../architecture/state-management.md)

---

**Questions?** See [Common Issues](../troubleshooting/common-issues.md) or [join Discord](https://discord.gg/luna402).
