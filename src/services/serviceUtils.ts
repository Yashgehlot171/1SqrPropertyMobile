export async function simulateNetwork<T>(payload: T, delay = 150): Promise<T> {
  await new Promise<void>(resolve => {
    setTimeout(resolve, delay);
  });
  return JSON.parse(JSON.stringify(payload)) as T;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}
