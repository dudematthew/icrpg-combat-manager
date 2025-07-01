import { Randomizer } from "./randomizer";

export enum RandomSource {
  TRUE_RANDOM = "true-random",
  PSEUDO_RANDOM = "pseudo-random",
}

interface RandomServiceConfig {
  preferTrueRandom: boolean;
  fallbackToPseudo: boolean;
  requestTimeout: number; // in milliseconds
}

class RandomService {
  private randomizer: Randomizer;
  private config: RandomServiceConfig;
  private isOnline: boolean = true;

  constructor(config: Partial<RandomServiceConfig> = {}) {
    this.config = {
      preferTrueRandom: true,
      fallbackToPseudo: true,
      requestTimeout: 5000, // 5 seconds
      ...config,
    };

    this.randomizer = new Randomizer();

    // Set up error handling
    this.randomizer.on("connection-error", (error) => {
      console.warn("True random service unavailable, falling back to pseudo-random:", error);
      this.isOnline = false;
    });
  }

  /**
   * Get a random number between min and max (inclusive)
   * @param min minimum value
   * @param max maximum value
   * @param forcePseudo force use of pseudo-random (for testing or offline use)
   */
  async getRandomNumber(
    min: number,
    max: number,
    forcePseudo: boolean = false
  ): Promise<{
    value: number;
    source: RandomSource;
  }> {
    // Always use pseudo-random if forced or if true random is disabled
    if (forcePseudo || !this.config.preferTrueRandom) {
      return {
        value: this.getPseudoRandom(min, max),
        source: RandomSource.PSEUDO_RANDOM,
      };
    }

    // Try true random if online and configured to do so
    if (this.isOnline && this.config.preferTrueRandom) {
      try {
        const value = await Promise.race([
          this.randomizer.getRandomNumber(min, max),
          this.timeoutPromise(),
        ]);

        return {
          value,
          source: RandomSource.TRUE_RANDOM,
        };
      } catch (error) {
        console.warn("True random failed:", error);
        this.isOnline = false;

        // Fall back to pseudo-random if configured to do so
        if (this.config.fallbackToPseudo) {
          return {
            value: this.getPseudoRandom(min, max),
            source: RandomSource.PSEUDO_RANDOM,
          };
        }

        throw new Error("True random service unavailable and fallback is disabled");
      }
    }

    // Fallback to pseudo-random
    return {
      value: this.getPseudoRandom(min, max),
      source: RandomSource.PSEUDO_RANDOM,
    };
  }

  /**
   * Roll a die with specified number of sides
   * @param sides number of sides on the die
   * @param forcePseudo force use of pseudo-random
   */
  async rollDie(
    sides: number,
    forcePseudo: boolean = false
  ): Promise<{
    value: number;
    source: RandomSource;
  }> {
    return this.getRandomNumber(1, sides, forcePseudo);
  }

  /**
   * Roll a d20
   * @param forcePseudo force use of pseudo-random
   */
  async rollD20(forcePseudo: boolean = false): Promise<{
    value: number;
    source: RandomSource;
  }> {
    return this.rollDie(20, forcePseudo);
  }

  /**
   * Generate pseudo-random number using Math.random()
   * @param min minimum value
   * @param max maximum value
   */
  private getPseudoRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Create a timeout promise for request timeout handling
   */
  private timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${this.config.requestTimeout}ms`));
      }, this.config.requestTimeout);
    });
  }

  /**
   * Check if true random service is available
   */
  isOnlineService(): boolean {
    return this.isOnline;
  }

  /**
   * Force retry of true random service
   */
  retryOnlineService(): void {
    this.isOnline = true;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RandomServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export singleton instance
export const randomService = new RandomService();

// Export class for testing or custom instances
export { RandomService };
