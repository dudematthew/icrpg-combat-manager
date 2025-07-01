# ICRPG Combat Manager

A comprehensive combat management tool for Index Card RPG (ICRPG) built with Vue 3, TypeScript, and PrimeVue. This app provides everything you need to run smooth ICRPG combat sessions with monster management, timer tracking, and combat mechanics.

## Features

- **Monster Management**: Create and manage monsters with ICRPG tier system (I-IV)
- **Heart-based HP Tracking**: Authentic ICRPG heart system with HP conversion
- **Condition Tracking**: Full condition management with auto-damage
- **Timer System**: Dual timer types - rounds and turns for different effect durations
- **Combat Mechanics**: Scene target numbers, difficulty modifiers, and attack rolling
- **Persistent Storage**: All data saved to localStorage
- **Mobile Optimized**: Clean, responsive design optimized for mobile devices
- **ICRPG Authentic**: True to ICRPG rules and aesthetics

## Deployment URL Configuration

This project is configured with a custom base URL for deployment. The current configuration in `vite.config.ts` sets:

```typescript
base: "/icrpgcm/"
```

### For Different Deployment Scenarios:

#### Root Domain Deployment
If deploying to the root of a domain (e.g., `https://yourdomain.com/`):
```typescript
// vite.config.ts
export default defineConfig({
  base: "/", // or remove the base property entirely
  // ... other config
})
```

#### Subdirectory Deployment
If deploying to a subdirectory (e.g., `https://yourdomain.com/yourapp/`):
```typescript
// vite.config.ts
export default defineConfig({
  base: "/yourapp/", // Replace 'yourapp' with your subdirectory name
  // ... other config
})
```

#### GitHub Pages Deployment
If deploying to GitHub Pages (e.g., `https://username.github.io/repository-name/`):
```typescript
// vite.config.ts
export default defineConfig({
  base: "/repository-name/", // Replace with your GitHub repository name
  // ... other config
})
```

### Important Notes:
- Always include trailing slash in the base path
- After changing the base URL, run `npm run build` to rebuild with correct asset paths
- The `.htaccess` file in the `public` folder is configured for subdirectory deployment and includes proper MIME types and SPA routing

## Tech Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **PrimeVue** - Comprehensive UI component library
- **Pinia** - State management with localStorage persistence
- **Custom CSS** - ICRPG-themed styling with responsive design
- **True Random API** - External randomness for dice rolls

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Project Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd icrpg-combat-manager

# Install dependencies
npm install
```

### Development

Start the development server with hot-reload:

```sh
npm run dev
```

The app will be available at `http://localhost:5173/icrpgcm/` (or the next available port).

### Production Build

Build for production deployment:

```sh
npm run build
```

This creates optimized files in the `dist/` directory ready for deployment.

### Testing

Run unit tests with [Vitest](https://vitest.dev/):

```sh
npm run test:unit
```

### Code Quality

Lint code with [ESLint](https://eslint.org/):

```sh
npm run lint
```

Type-check with TypeScript:

```sh
npm run type-check
```

## Usage

1. **Create Monsters**: Use the Monster Creator to add monsters with appropriate tiers
2. **Manage Combat**: Track HP, conditions, and special abilities
3. **Set Timers**: Create round-based or turn-based timers for effects
4. **Roll Attacks**: Use the built-in combat mechanics for quick rolls
5. **Track Progression**: Use Next Turn/Round buttons to advance combat

## Customization

See [Vite Configuration Reference](https://vite.dev/config/) for build customization options.
