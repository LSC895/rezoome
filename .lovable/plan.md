
# Fix Plan: Resolve Build Error - Missing main.tsx

## Problem Identified

The project is failing to build with this error:
```
vite: Rollup failed to resolve import "/src/main.tsx" from "/builds/1/project/index.html"
```

### Root Cause Analysis

The project has a **split structure problem**:

| What exists | What's expected |
|-------------|-----------------|
| `index.html` references `/src/main.tsx` | File doesn't exist |
| `frontend/src/main.tsx` has the actual React app | Not being used |
| `src/` folder only has `integrations/` and config | Missing `main.tsx` |

The Vite config at root expects files in `./src/`, but all the actual app code lives in `frontend/src/`.

## Solution

Move the entire frontend application from `frontend/src/` to `src/` so the paths match what `index.html` and `vite.config.ts` expect.

## Files to Create/Move

### 1. Create `src/main.tsx`
Copy from `frontend/src/main.tsx` but remove Clerk dependency (since it's not configured):

```typescript
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
```

### 2. Create `src/App.tsx`
Copy from `frontend/src/App.tsx`

### 3. Create `src/index.css`
Copy from `frontend/src/index.css`

### 4. Move all required folders
- `frontend/src/components/` to `src/components/`
- `frontend/src/pages/` to `src/pages/`
- `frontend/src/hooks/` to `src/hooks/`
- `frontend/src/lib/` to `src/lib/`

### 5. Keep existing `src/integrations/` 
Already exists and contains Supabase client

## Technical Details

### Files to Create (from frontend/src)
| Source | Destination |
|--------|-------------|
| `frontend/src/main.tsx` | `src/main.tsx` (modified - no Clerk) |
| `frontend/src/App.tsx` | `src/App.tsx` |
| `frontend/src/App.css` | `src/App.css` |
| `frontend/src/index.css` | `src/index.css` |
| `frontend/src/components/*` | `src/components/*` |
| `frontend/src/pages/*` | `src/pages/*` |
| `frontend/src/hooks/*` | `src/hooks/*` |
| `frontend/src/lib/*` | `src/lib/*` |

### Configuration Files (no changes needed)
- `vite.config.ts` - Already configured with `"@": "./src"` alias
- `index.html` - Already references `/src/main.tsx`
- `tailwind.config.ts` - Already configured

### Clerk Authentication Removal
The `frontend/src/main.tsx` uses Clerk which requires `VITE_CLERK_PUBLISHABLE_KEY`. Since this isn't configured, we'll create a simpler entry point without auth for now.

## Implementation Steps

1. **Create core entry files**: `main.tsx`, `App.tsx`, `index.css`, `App.css`
2. **Create components folder**: Move all UI components
3. **Create pages folder**: Move all page components  
4. **Create hooks folder**: Move all custom hooks
5. **Create lib folder**: Move utility functions

## Expected Outcome

After implementation:
- Build will succeed
- App will load at root URL `/`
- All routes (`/`, `/roast`, etc.) will work
- No Clerk dependency (can add later if needed)
