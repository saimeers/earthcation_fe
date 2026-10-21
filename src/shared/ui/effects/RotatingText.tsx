import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'motion/react'
import { cn } from '@/shared/lib/utils'

// Texto que rota entre varias palabras, letra a letra (adaptado de React Bits).

type StaggerFrom = 'first' | 'last' | 'center' | 'random' | number

interface RotatingTextProps {
  texts: string[]
  transition?: Transition
  initial?: TargetAndTransition
  animate?: TargetAndTransition
  exit?: TargetAndTransition
  animatePresenceMode?: 'wait' | 'sync' | 'popLayout'
  animatePresenceInitial?: boolean
  rotationInterval?: number
  staggerDuration?: number
  staggerFrom?: StaggerFrom
  loop?: boolean
  auto?: boolean
  splitBy?: 'characters' | 'words' | 'lines' | (string & {})
  onNext?: (index: number) => void
  mainClassName?: string
  splitLevelClassName?: string
  elementLevelClassName?: string
}

const splitIntoCharacters = (text: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), segment => segment.segment)
  }
  return Array.from(text)
}

function splitText(text: string, splitBy: string): { characters: string[], needsSpace: boolean }[] {
  if (splitBy === 'characters') {
    const words = text.split(' ')
    return words.map((word, i) => ({ characters: splitIntoCharacters(word), needsSpace: i !== words.length - 1 }))
  }
  const separator = splitBy === 'words' ? ' ' : splitBy === 'lines' ? '\n' : splitBy
  return text.split(separator).map((part, i, arr) => ({ characters: [part], needsSpace: i !== arr.length - 1 }))
}

function staggerDelay(from: StaggerFrom, duration: number, index: number, total: number): number {
  if (from === 'first') return index * duration
  if (from === 'last') return (total - 1 - index) * duration
  if (from === 'center') return Math.abs(Math.floor(total / 2) - index) * duration
  if (from === 'random') return Math.abs(Math.floor(Math.random() * total) - index) * duration
  return Math.abs(from - index) * duration
}

export default function RotatingText({
  texts,
  transition = { type: 'spring', damping: 25, stiffness: 300 },
  initial = { y: '100%', opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: '-120%', opacity: 0 },
  animatePresenceMode = 'wait',
  animatePresenceInitial = false,
  rotationInterval = 2000,
  staggerDuration = 0,
  staggerFrom = 'first',
  loop = true,
  auto = true,
  splitBy = 'characters',
  onNext,
  mainClassName,
  splitLevelClassName,
  elementLevelClassName,
}: RotatingTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const elements = useMemo(() => splitText(texts[currentTextIndex], splitBy), [texts, currentTextIndex, splitBy])
  const totalChars = elements.reduce((sum, word) => sum + word.characters.length, 0)

  const next = useCallback(() => {
    const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1
    if (nextIndex !== currentTextIndex) {
      setCurrentTextIndex(nextIndex)
      onNext?.(nextIndex)
    }
  }, [currentTextIndex, texts.length, loop, onNext])

  useEffect(() => {
    if (!auto) return
    const intervalId = setInterval(next, rotationInterval)
    return () => clearInterval(intervalId)
  }, [next, rotationInterval, auto])

  return (
    <motion.span className={cn('flex flex-wrap whitespace-pre-wrap relative', mainClassName)} layout transition={transition}>
      <span className="sr-only">{texts[currentTextIndex]}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span
          key={currentTextIndex}
          className={cn(splitBy === 'lines' ? 'flex flex-col w-full' : 'flex flex-wrap whitespace-pre-wrap relative')}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex, array) => {
            const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0)
            return (
              <span key={wordIndex} className={cn('inline-flex', splitLevelClassName)}>
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{ ...transition, delay: staggerDelay(staggerFrom, staggerDuration, previousCharsCount + charIndex, totalChars) }}
                    className={cn('inline-block', elementLevelClassName)}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            )
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}
