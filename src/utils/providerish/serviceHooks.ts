import { Context, createContext, useCallback, useContext, useSyncExternalStore } from "react"
import { assert } from "tsafe"

import { Option } from "../types/Option"
import { AbstractService } from "./AbstractService"

export const createOptionalContext = <T>(): Context<Option<T>> => createContext<Option<T>>(undefined)

export const useService = <T>(context: Context<Option<T>>): T => {
  const service = useContext(context)
  assert(service !== undefined, "Cannot find service in context - Provider missing?")
  return service
}

export const useServiceStateSelector = <State extends object, Service extends AbstractService<State>, Selected>(
  context: Context<Option<Service>>,
  selector: (state: State) => Selected,
): Selected => {
  const service = useService(context)
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      service.addListener(onStoreChange)
      return () => service.removeListener(onStoreChange)
    },
    [service],
  )
  const getSnapshot = useCallback(() => selector(service.state), [service, selector])
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
