# ICRPG Combat Manager - True Random Service Integration Guide

## Overview

Your ICRPG Combat Manager now includes a sophisticated random number service that can use **true random numbers** from random.org instead of pseudo-random numbers from `Math.random()`. This provides better randomness for your dice rolls while maintaining full backward compatibility.

## Architecture

### Files Created/Modified

1. **`src/utils/randomizer.ts`** - TypeScript version of your Randomizer class
2. **`src/utils/randomService.ts`** - Service wrapper with fallback capabilities  
3. **`src/utils/combat.ts`** - Updated with async random functions
4. **`src/components/CombatMechanics.vue`** - Updated UI with random source toggle
5. **`src/utils/test-randomizer.ts`** - Test utilities

## How It Works

### 1. The Randomizer Class (`randomizer.ts`)

Your improved JavaScript class, converted to TypeScript with these key features:

- **Efficient API Usage**: Pre-fetches decimal fractions and stores them in memory
- **Smart Refilling**: Only fetches new numbers when cache is low (configurable threshold)
- **Simplified Architecture**: Single array instead of multiple range-specific sets
- **Better Math**: Uses decimal fractions for more precise range conversion
- **Enhanced Events**: `fetch-start`, `fetch-end`, and `connection-error` events
- **Error Handling**: Graceful fallback when random.org is unavailable

```typescript
// Usage example
const randomizer = new Randomizer(20, 20); // Keep 20 numbers, refill at 20%
const number = await randomizer.getRandomNumber(1, 20); // Roll d20
```

**Key Improvements in Your New Design:**
- Uses `decimal-fractions` API endpoint instead of `integers` for better precision
- Simplified single array storage instead of complex multi-range management
- More efficient math: `Math.floor(decimal * range) + min` 
- Better event system with start/end fetch notifications

### 2. The Random Service (`randomService.ts`)

A higher-level service that manages both true random and pseudo-random generation:

```typescript
// Simple usage
import { randomService } from '@/utils/randomService';

const d20 = await randomService.rollD20();
console.log(`Rolled: ${d20.value} (Source: ${d20.source})`);

// Force pseudo-random (for testing or offline)
const pseudoD20 = await randomService.rollD20(true);
```

### 3. Combat Integration

Your combat system now has both sync and async versions:

```typescript
// Legacy (still works)
const oldRoll = makeAttack(statBonus, target, effortDie, isHard, isEasy);

// New async version with true random
const newRoll = await makeAttackAsync(statBonus, target, effortDie, isHard, isEasy);
console.log(`Used: ${newRoll.randomSource}`); // Shows which random source was used
```

## Configuration

### Random Service Config

You can customize the service behavior:

```typescript
import { RandomService } from '@/utils/randomService';

const customService = new RandomService({
  preferTrueRandom: true,      // Try true random first
  fallbackToPseudo: true,      // Fall back to Math.random() on failure
  requestTimeout: 5000         // Timeout for random.org requests (ms)
});
```

### Randomizer Config

You can also customize the underlying randomizer:

```typescript
import { Randomizer } from '@/utils/randomizer';

const customRandomizer = new Randomizer(
  20,  // Keep 20 numbers in cache per range
  30   // Refill when cache drops to 30% or below
);
```

## Testing Your Implementation

### 1. Manual Testing in Browser

1. Start your dev server: `npm run dev`
2. Navigate to the Combat Manager page
3. Try rolling with both "True Random" and "Pseudo Random" modes
4. Check the browser console for detailed logs
5. Look for the random source indicator in the roll results

### 2. Programmatic Testing

Open your browser console and run:

```javascript
// Import the test function (if you add it to your component)
import { testRandomizer } from '@/utils/test-randomizer';
testRandomizer();
```

### 3. PowerShell Testing Commands

```powershell
# Check build for errors
npm run build

# Run development server
npm run dev

# Type check only
npm run type-check
```

## Usage Examples

### Basic Dice Rolling

```typescript
import { randomService } from '@/utils/randomService';

// Roll various dice
const d4 = await randomService.rollDie(4);
const d6 = await randomService.rollDie(6);  
const d8 = await randomService.rollDie(8);
const d10 = await randomService.rollDie(10);
const d12 = await randomService.rollDie(12);
const d20 = await randomService.rollD20();

// Custom ranges
const percentile = await randomService.getRandomNumber(1, 100);
const initiative = await randomService.getRandomNumber(1, 20);
```

### In Vue Components

```vue
<script setup lang="ts">
import { randomService } from '@/utils/randomService';
import { ref } from 'vue';

const isRolling = ref(false);
const result = ref(null);

const rollDice = async () => {
  isRolling.value = true;
  try {
    const roll = await randomService.rollD20();
    result.value = roll;
  } catch (error) {
    console.error('Roll failed:', error);
  } finally {
    isRolling.value = false;
  }
};
</script>
```

### Error Handling

```typescript
try {
  const roll = await randomService.rollD20();
  console.log(`Rolled ${roll.value} using ${roll.source}`);
} catch (error) {
  console.error('Failed to roll:', error);
  // Service automatically falls back to pseudo-random
}
```

### Event System (Advanced Usage)

Your improved Randomizer class now supports three events:

```typescript
import { Randomizer } from '@/utils/randomizer';

const randomizer = new Randomizer();

// Monitor fetch operations
randomizer.on('fetch-start', (amount) => {
  console.log(`🔄 Fetching ${amount} random numbers...`);
});

randomizer.on('fetch-end', (numbers) => {
  console.log(`✅ Fetched ${numbers?.length} numbers successfully`);
});

randomizer.on('connection-error', (error) => {
  console.error('❌ Random.org connection failed:', error);
});

// Use the randomizer
const number = await randomizer.getRandomNumber(1, 20);
```

## Monitoring and Debugging

### Console Logs

The service provides detailed logging:
- `"Requested | min | max | keepAmount"` - When a number is requested
- `"Random numbers request pending (min > max)..."` - API request started
- `"Random numbers request done: [numbers]"` - API request completed
- `"Refilling needed"` / `"Refilling aborted"` - Cache management

### Service Status

```typescript
// Check if true random is available
if (randomService.isOnlineService()) {
  console.log('True random available');
} else {
  console.log('Using fallback pseudo-random');
}

// Force retry of true random service
randomService.retryOnlineService();
```

## Best Practices

### 1. Use Async/Await Pattern

```typescript
// Good
const handleRoll = async () => {
  const result = await randomService.rollD20();
  updateUI(result);
};

// Avoid (loses error handling)
randomService.rollD20().then(result => updateUI(result));
```

### 2. Handle Loading States

```typescript
const [isRolling, setIsRolling] = useState(false);

const roll = async () => {
  setIsRolling(true);
  try {
    const result = await randomService.rollD20();
    // Handle result
  } finally {
    setIsRolling(false);
  }
};
```

### 3. Provide User Feedback

Always show users:
- Loading state during rolls
- Which random source was used
- Error messages if random.org is unavailable

## Extending the System

### Adding New Dice Types

```typescript
// In randomService.ts, add methods like:
async rollD100(forcePseudo: boolean = false) {
  return this.getRandomNumber(1, 100, forcePseudo);
}

async rollFudge(forcePseudo: boolean = false) {
  return this.getRandomNumber(-1, 1, forcePseudo);
}
```

### Custom Random Sources

```typescript
// You could extend to use other APIs
class MultiSourceRandomService extends RandomService {
  async getRandomFromSource(source: 'random.org' | 'atmospheric-noise' | 'quantum') {
    // Implementation for different sources
  }
}
```

### Statistics and Analytics

```typescript
// Track random source usage
class AnalyticsRandomService extends RandomService {
  private stats = { trueRandom: 0, pseudoRandom: 0 };
  
  async rollD20(forcePseudo = false) {
    const result = await super.rollD20(forcePseudo);
    this.stats[result.source === 'true-random' ? 'trueRandom' : 'pseudoRandom']++;
    return result;
  }
}
```

## Troubleshooting

### Common Issues

1. **"Connection error with random.org"**
   - Solution: Service automatically falls back to pseudo-random
   - Check internet connection and random.org availability

2. **"Request timeout after 5000ms"**
   - Solution: Increase timeout in service config
   - Or force pseudo-random for faster results

3. **TypeScript errors**
   - Ensure all imports are correct
   - Check that async functions are properly awaited

### PowerShell Commands for Debugging

```powershell
# Check for TypeScript errors
npm run type-check

# Build and check for compilation errors  
npm run build

# Start dev server with verbose logging
npm run dev

# Check if random.org is accessible
curl "https://www.random.org/integers/?num=1&min=1&max=20&col=1&base=10&format=plain&rnd=new"
```

## Performance Considerations

- **Network Latency**: First roll may be slower (fetching from random.org)
- **Caching**: Subsequent rolls are fast (using cached values)
- **Memory Usage**: Service stores ~10-20 numbers per dice type in memory
- **Rate Limiting**: random.org has daily quotas (check at random.org/quota/)

Your implementation is now ready for production use with both true random and pseudo-random capabilities! 