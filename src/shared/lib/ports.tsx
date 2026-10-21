import { createContext, useContext, useMemo, type ReactNode } from 'react'

// Inyección de dependencias mínima para los puertos de cada feature: `application` declara el puerto
// (interfaz + clave), `infrastructure` lo implementa y la composición de la app (src/app) los conecta.
// Las pruebas de los hooks inyectan implementaciones falsas con <PortsProvider>.

/** Clave tipada de un puerto. */
export interface Port<T> {
  readonly id: string
  /** Solo para inferir el tipo; nunca tiene valor. */
  readonly __type?: T
}

export interface PortBinding {
  readonly id: string
  readonly impl: unknown
}

export const definePort = <T,>(id: string): Port<T> => ({ id })

/** Une un puerto con su implementación (se pasa a <PortsProvider bindings>). */
export const bindPort = <T,>(port: Port<T>, impl: T): PortBinding => ({ id: port.id, impl })

const PortsContext = createContext<ReadonlyMap<string, unknown>>(new Map())

export function PortsProvider({ bindings, children }: { bindings: readonly PortBinding[], children: ReactNode }) {
  const parent = useContext(PortsContext)
  const registry = useMemo(() => {
    const next = new Map(parent)
    bindings.forEach(b => next.set(b.id, b.impl))
    return next
  }, [parent, bindings])
  return <PortsContext.Provider value={registry}>{children}</PortsContext.Provider>
}

export function usePort<T>(port: Port<T>): T {
  const impl = useContext(PortsContext).get(port.id)
  if (!impl) throw new Error(`No hay implementación para el puerto «${port.id}»`)
  return impl as T
}
