# Project Structure

Understanding how necrona is organized will help you navigate, modify, and extend the codebase.

## Directory Overview

```
Necrona/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   └── chat/
│   │       └── route.js          # Chat API endpoint
│   ├── app/                      # Chat application page
│   │   └── page.js               # Chat interface
│   ├── components/               # Shared React components
│   │   └── MatrixRain.js         # Matrix rain animation
│   ├── globals.css               # Global styles & Tailwind
│   ├── layout.js                 # Root layout component
│   └── page.js                   # Landing page
├── docs/                         # GitBook documentation
│   ├── getting-started/
│   ├── features/
│   ├── architecture/
│   └── ...
├── public/                       # Static assets
├── node_modules/                 # Dependencies (gitignored)
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies & scripts
├── package-lock.json             # Locked dependency versions
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # Project README
```

## Core Files Explained

### `/app/layout.js`

Root layout component that wraps all pages.

```javascript
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: 'Necrona - AI-Powered Crypto Intelligence',
  description: 'Get AI-powered insights...',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>{children}</body>
    </html>
  );
}
```

**Purpose:**

- Defines app-wide metadata (title, description)
- Loads and configures fonts
- Imports global styles
- Wraps all pages with consistent structure

### `/app/page.js`

Landing page with hero section, features, and marketing content.

**Key sections:**

- Hero with animated text and CTA buttons
- Stats bar (72K+ tokens analyzed, etc.)
- Features grid (6 feature cards)
- How It Works section (3-step process)
- Use Cases section (4 user personas)
- FAQ section (6 common questions)
- Footer with links and disclaimer

**Technologies used:**

- Framer Motion for animations
- Lucide React for icons
- Matrix Rain component for background

### `/app/app/page.js`

Chat interface where users interact with the AI.

**Key features:**

- Real-time streaming chat
- Contract address input field
- Rate limiting with 50s cooldown
- localStorage persistence
- Markdown rendering for AI responses
- Animated message appearance

**State management:**

```javascript
const [input, setInput] = useState('');
const [cooldownRemaining, setCooldownRemaining] = useState(0);
const [lastSubmitTime, setLastSubmitTime] = useState(0);
const [contractAddress, setContractAddress] = useState('');
```

### `/app/api/chat/route.js`

Backend API route that handles chat requests.

**Responsibilities:**

- Receives user messages
- Configures AI model (Gemini 2.5 Flash)
- Defines system prompt with security measures
- Enables web search tools
- Streams AI responses back to client

**Configuration:**

```javascript
export const maxDuration = 50;

const result = streamText({
  model: google('gemini-2.5-flash'),
  tools: {
    google_search: google.tools.googleSearch({}),
    url_context: google.tools.urlContext({}),
  },
  system: systemPrompt,
  messages: convertToModelMessages(messages),
  temperature: 0.7,
  maxTokens: 4000,
});
```

### `/app/components/MatrixRain.js`

Animated Matrix-style rain background effect.

**Implementation:**

- Canvas-based animation
- Green characters falling
- Randomized speed and positioning
- Auto-resizes with window

### `/app/globals.css`

Global styles including Tailwind imports and custom CSS.

```css
@import "tailwindcss";

/* Custom markdown styles */
.markdown-content { ... }

/* Custom animations */
@keyframes pulse { ... }
```

## Next.js App Router

Necrona uses Next.js 16's App Router architecture:

### File-Based Routing

- `/app/page.js` → `http://localhost:3000/`
- `/app/app/page.js` → `http://localhost:3000/app`
- `/app/api/chat/route.js` → `http://localhost:3000/api/chat`

### Server vs Client Components

**Server Components (default):**

- `/app/layout.js` (except where client features needed)
- Better performance, smaller bundle

**Client Components (`'use client'`):**

- `/app/page.js` (uses Framer Motion)
- `/app/app/page.js` (interactive chat)
- `/app/components/MatrixRain.js` (canvas animation)

## Data Flow

### User Message Flow

```
User Input
    ↓
Submit Handler (app/app/page.js)
    ↓
Rate Limit Check
    ↓
sendMessage() from useChat hook
    ↓
POST /api/chat
    ↓
System Prompt + User Message
    ↓
Gemini AI Model
    ↓
Stream Response (with web search)
    ↓
Display in Chat UI
```

### Rate Limiting Flow

```
Submit Attempt
    ↓
Check lastSubmitTime in state
    ↓
Check localStorage ('lastSubmitTime')
    ↓
If < 50 seconds → Block + Show Countdown
    ↓
If >= 50 seconds → Allow + Set New Time
    ↓
Store timestamp in localStorage
    ↓
Start countdown timer
```

## State Management

### Global State

Necrona uses React hooks for state management:

- `useState` - Local component state
- `useEffect` - Side effects (timers, localStorage)
- `useRef` - DOM references (scroll)
- `useChat` - Vercel AI SDK hook for chat

### Persistent State

- **localStorage** - Rate limit timestamps
- **Session** - None (fresh on reload)
- **Database** - None (stateless)

## Styling Architecture

### Tailwind CSS 4

Utility-first CSS framework:

```jsx
<div className="px-6 py-4 bg-[#0f9d58]/5 border border-[#0f9d58]/20">
```

### Custom Colors

Green theme with variations:

- `#0f9d58` - Primary green
- `#1db954` - Secondary green
- `#a8daad` - Light green
- `/5`, `/10`, `/20` - Opacity modifiers

### Responsive Design

Mobile-first approach:

```jsx
<div className="text-xl md:text-3xl lg:text-5xl">
```

## Build Process

### Development

```bash
npm run dev
```

1. Next.js starts dev server
2. Tailwind CSS processes styles
3. Hot module replacement enabled
4. Port 3000 (default)

### Production

```bash
npm run build
npm start
```

1. Next.js optimizes and bundles
2. Tailwind purges unused CSS
3. Code splitting and minification
4. Static generation where possible

## Dependencies Overview

### Core Dependencies

| Package          | Purpose               | Version |
| ---------------- | --------------------- | ------- |
| `next`           | React framework       | 16.0.0  |
| `react`          | UI library            | 19.2.0  |
| `ai`             | Vercel AI SDK         | 5.0.76  |
| `@ai-sdk/google` | Google AI integration | 2.0.23  |
| `@ai-sdk/react`  | React hooks for AI    | 2.0.76  |

### UI Dependencies

| Package          | Purpose                  |
| ---------------- | ------------------------ |
| `tailwindcss`    | Utility CSS framework    |
| `framer-motion`  | Animation library        |
| `lucide-react`   | Icon library             |
| `react-markdown` | Markdown rendering       |
| `remark-gfm`     | GitHub Flavored Markdown |

## Security Considerations

### Environment Variables

- Never committed to git
- Server-side only (not exposed to browser)
- Required for AI API access

### API Rate Limiting

- 50-second client-side cooldown
- 50-second server-side max duration
- localStorage-based persistence

### Prompt Injection Protection

- System prompt hardening
- Multiple security layers
- Pattern recognition for attacks

## Performance Optimizations

### Code Splitting

Next.js automatically splits code by route:

- Landing page bundle
- Chat page bundle
- Shared components bundle

### Image Optimization

Next.js Image component (if used):

- Automatic WebP conversion
- Lazy loading
- Responsive sizes

### Streaming Responses

AI responses stream token-by-token:

- Faster perceived performance
- Progressive rendering
- Better UX

## Extension Points

Where to add new features:

- **New pages**: `/app/your-page/page.js`
- **New API routes**: `/app/api/your-route/route.js`
- **New components**: `/app/components/YourComponent.js`
- **Shared utilities**: `/lib/utils.js` (create if needed)

## Next Steps

- Learn about [API Routes](api-routes.md) in detail
- Explore [Frontend Components](frontend-components.md)
- Understand [State Management](state-management.md)
- Read about [AI System Prompt](ai-system-prompt.md)

---



