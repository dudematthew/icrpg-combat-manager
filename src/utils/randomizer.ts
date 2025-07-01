interface EventHandler {
  (data?: any): void;
}

export class Randomizer {
  private randomNumbersKeepAmount: number;
  private neededPercentToRefill: number;
  private randomNumberSet: number[];
  private requestPending: boolean;
  private currentlyRefilling: boolean;
  private connectionError: EventHandler;
  private fetchStart: EventHandler;
  private fetchEnd: EventHandler;

  /**
   * Allows efficient use of www.random.org true
   * random numbers with ability to store numbers
   * in memory in advance for next calls
   *
   * TODO: add checking if quota is used up from API
   * https://www.random.org/quota/?format=plain
   *
   * @param randomNumbersKeepAmount how many numbers to refill to memory in one number set
   * @param neededPercentToRefill how low amount of numbers in memory in one set is needed to refill
   */
  constructor(randomNumbersKeepAmount: number = 20, neededPercentToRefill: number = 20) {
    this.randomNumbersKeepAmount = randomNumbersKeepAmount;
    this.neededPercentToRefill = neededPercentToRefill;
    this.randomNumberSet = [];
    this.requestPending = false;
    this.currentlyRefilling = false;
    this.connectionError = this.defaultConnectionError;
    this.fetchStart = this.defaultFetchStart;
    this.fetchEnd = this.defaultFetchEnd;
  }

  /**
   * Get random number between two points
   * @param from random number minimum value
   * @param to random number maximum value
   * @param keepAmount how many random numbers to keep in memory
   */
  async getRandomNumber(
    from: number = 0,
    to: number = 1,
    keepAmount: number = this.randomNumbersKeepAmount
  ): Promise<number> {
    console.log(`Requested | ${from} | ${to} | ${keepAmount}`);

    if (this.randomNumberSet.length !== 0) {
      if (this.randomNumberSet.length <= keepAmount * (this.neededPercentToRefill / 100)) {
        await this.waitForRequestFinish();
        this.refillRandomNumbers(keepAmount);
      }
      console.log("Random number popping... Currently ", this.randomNumberSet);
      const randomDecimal = this.randomNumberSet.pop();
      return randomDecimal
        ? Math.floor(randomDecimal * to) + from
        : await this.getRandomNumber(from, to, keepAmount);
    } else {
      await this.waitForRequestFinish();
      await this.refillRandomNumbers(keepAmount);
      return await this.getRandomNumber(from, to, keepAmount);
    }
  }

  /**
   * Returns true when current request is finished
   */
  private async waitForRequestFinish(): Promise<boolean> {
    while (this.requestPending) {
      console.log("Not finished, retrying...");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return true;
  }

  /**
   * Refill saved number sets
   * @param keepAmount how many numbers to keep in memory
   */
  private async refillRandomNumbers(
    keepAmount: number = this.randomNumbersKeepAmount
  ): Promise<number> {
    // Check if there is an ongoing refill
    if (this.currentlyRefilling || this.requestPending) {
      console.log("Refilling aborted. Currently random numbers are being refilled.");
      return 1;
    } else {
      console.log("Refilling needed.");
    }

    // Indicate global refilling info
    this.currentlyRefilling = true;

    // Calculate amount of numbers that needs to be fetched
    const amount = keepAmount - this.randomNumberSet.length;
    console.log("Amount to fill: ", amount);

    // Amount has to be greater than x percent
    if (amount <= this.randomNumbersKeepAmount * (this.neededPercentToRefill / 100)) {
      console.log("Amount is too low: ", amount);
      this.currentlyRefilling = false;
      return 0;
    }

    const randomNumbers = await this.fetchRandomNumbers(amount);

    if (randomNumbers !== null) {
      this.randomNumberSet = this.randomNumberSet.concat(randomNumbers);
    }

    console.log("Refill done, currently: ", this.randomNumberSet);
    // Indicate refill completion
    this.currentlyRefilling = false;

    return 1;
  }

  /**
   * Set up event handlers
   * @param eventName event name to listen for
   * @param callbackFunction function to call on event
   */
  on(eventName: string, callbackFunction: EventHandler): void {
    switch (eventName) {
      case "connection-error":
        this.connectionError = callbackFunction;
        break;
      case "fetch-start":
        this.fetchStart = callbackFunction;
        break;
      case "fetch-end":
        this.fetchEnd = callbackFunction;
        break;
      default:
        console.error("There is no event name called " + eventName);
    }
  }

  /**
   * Make HTTP request using XMLHttpRequest
   * @param method HTTP method
   * @param url URL to request
   */
  private makeRequest(method: string, url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      };
      xhr.onerror = () => {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      };
      xhr.send();
    });
  }

  /**
   * Gets specific amount of random numbers from www.random.org api
   * @param amount amount of numbers to fetch
   * @returns array of random decimal fractions
   */
  private async fetchRandomNumbers(amount: number): Promise<number[] | null> {
    console.log(`Starting fetching ${amount} numbers`);

    let randomNumbers: number[] | null = null;

    this.requestPending = true;
    this.fetchStart(amount);

    try {
      const data = await this.makeRequest(
        "GET",
        `https://www.random.org/decimal-fractions/?dec=20&num=${amount}&col=1&format=plain`
      );
      randomNumbers = data
        .trim()
        .split("\n")
        .map((num) => parseFloat(num));
      this.fetchEnd(randomNumbers);
    } catch (error) {
      this.connectionError(error);
      randomNumbers = null;
    }

    this.requestPending = false;

    return randomNumbers;
  }

  /**
   * Default connection error handler
   * @param error error object or message
   */
  private defaultConnectionError(error: any = ""): void {
    console.error("There has been an error connecting to www.random.org: " + error);
  }

  /**
   * Default fetch start handler
   * @param amount amount of numbers being fetched
   */
  private defaultFetchStart(amount?: number): void {
    console.log(`Starting fetching ${amount} numbers`);
  }

  /**
   * Default fetch end handler
   * @param randomNumbers the fetched random numbers
   */
  private defaultFetchEnd(randomNumbers?: number[]): void {
    console.log("Finished fetching: ", randomNumbers);
  }
}
