export enum EndpointKey {
  SCHEDULE = "SCHEDULE",
  PUZZLES = "PUZZLES",
  SPECIES = "SPECIES",
}

export enum EndpointBehaviour {
  DEFAULT = "DEFAULT",
  ERROR = "ERROR",
  STALL = "STALL",
}

export class StallResponse extends Error {
  constructor() {
    super("StallResponse")
    this.name = "StallResponse"
  }
}

export class EndpointBehaviourManager {
  private readonly behaviours = new Map<EndpointKey, EndpointBehaviour>()
  private readonly pendingResolves = new Map<EndpointKey, (response: unknown) => void>()

  constructor() {
    for (const key of Object.values(EndpointKey)) {
      this.behaviours.set(key, EndpointBehaviour.DEFAULT)
    }
  }

  setBehaviour = (endpoint: EndpointKey, behaviour: EndpointBehaviour): void => {
    this.behaviours.set(endpoint, behaviour)
  }

  getBehaviour = (endpoint: EndpointKey): EndpointBehaviour => {
    const behaviour = this.behaviours.get(endpoint)
    if (behaviour === undefined) {
      throw new Error(`Unknown endpoint: ${endpoint}`)
    }
    return behaviour
  }

  waitForResolve = <T>(endpoint: EndpointKey): Promise<T> =>
    new Promise<T>((resolve) => {
      this.pendingResolves.set(endpoint, resolve as (response: unknown) => void)
    })

  resolve = (endpoint: EndpointKey, response: unknown): void => {
    const pendingResolve = this.pendingResolves.get(endpoint)
    pendingResolve?.(response)
    this.pendingResolves.delete(endpoint)
  }

  stall = <T>(endpoint: EndpointKey, defaultResponse: T) => {
    this.setBehaviour(endpoint, EndpointBehaviour.STALL)
    return {
      resolve: (response: T = defaultResponse) => this.resolve(endpoint, response),
    }
  }
}

export const handleEndpointBehaviour = <T>(behaviour: EndpointBehaviour, handler: () => T): T => {
  switch (behaviour) {
    case EndpointBehaviour.DEFAULT:
      return handler()
    case EndpointBehaviour.ERROR:
      throw new Error("Simulated error")
    case EndpointBehaviour.STALL:
      throw new StallResponse()
  }
}
