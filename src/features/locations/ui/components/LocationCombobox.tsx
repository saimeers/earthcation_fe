import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronsUpDown, MapPin, Search, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { findLocation, searchLocations, type Location } from '../../domain/locations'

interface LocationComboboxProps {
  locations?: Location[]
  value: string
  onChange: (id: string) => void
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
  allowClear?: boolean
  className?: string
}

// Selector buscable de municipio. Búsqueda sin tildes, teclado ↑ ↓ Enter, fondo opaco. Funciona
// dentro de un Dialog: la rueda del mouse se detiene aquí para que el bloqueo de scroll del modal no
// impida desplazar la lista.
export function LocationCombobox({ locations = [], value, onChange, disabled, invalid, placeholder = 'Selecciona un municipio', allowClear = false, className }: LocationComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => findLocation(locations, value), [locations, value])
  const results = useMemo(() => searchLocations(locations, query), [locations, query])

  const choose = (loc: Location | null) => {
    onChange(loc?.id ?? '')
    setOpen(false)
    setQuery('')
  }

  const scrollTo = (i: number) => listRef.current?.querySelector(`[data-index="${i}"]`)?.scrollIntoView({ block: 'nearest' })
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); scrollTo(active + 1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); scrollTo(active - 1) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) choose(results[active]) }
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setActive(0) }}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-invalid={invalid || undefined}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors outline-none',
            'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30',
            className,
          )}>
          <span className={cn('flex items-center gap-2 min-w-0', !selected && 'text-muted-foreground')}>
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {selected ? <>{selected.municipality} <span className="text-muted-foreground">· {selected.department}</span></> : placeholder}
            </span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {allowClear && selected && (
              <span role="button" tabIndex={-1} aria-label="Quitar" className="rounded p-0.5 hover:bg-muted" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); choose(null) }}>
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-72 p-0 z-[400] bg-popover border border-border shadow-xl"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={onKeyDown}
            placeholder="Buscar municipio o departamento…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div ref={listRef} role="listbox" className="max-h-64 overflow-y-auto p-1">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados para «{query}»</p>
          ) : results.map((l, i) => (
            <div
              key={l.id}
              role="option"
              aria-selected={l.id === value}
              data-index={i}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(l)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm',
                i === active && 'bg-accent text-accent-foreground',
              )}>
              <span className="min-w-0 truncate">{l.municipality} <span className="text-muted-foreground">· {l.department}</span></span>
              {l.id === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
