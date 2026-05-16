export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new AssertionError(message);
  }
}

export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new AssertionError(`${message}: ${String(value)}`);
}
