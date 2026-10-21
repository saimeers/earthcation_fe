import { useEffect, useState } from 'react'

const isDark = () => document.documentElement.classList.contains('dark')

/** true mientras `html` tenga la clase `dark`; se actualiza al cambiar el tema. */
export function useIsDark(): boolean {
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return dark
}
