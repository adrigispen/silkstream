export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error);

      if (attempt < maxAttempts) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw lastError!;
}
