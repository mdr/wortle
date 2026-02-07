export interface Clock {
  readonly now: () => Date
}

export const realClock: Clock = { now: () => new Date() }
