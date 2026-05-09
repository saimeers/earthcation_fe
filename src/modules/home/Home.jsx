import { useState, useEffect }  from 'react'
import Navbar                   from './components/Navbar'
import Hero                     from './components/Hero'
import About                    from './components/About'
import Features                 from './components/Features'
import Footer                   from './components/Footer'
import Aurora                   from '@/components/Aurora'

const AURORA_DARK  = ['#0f3460', '#16213e', '#533483']  
const AURORA_LIGHT = ['#c9d6ff', '#e2e2e2', '#a8c0ff']  

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark')
    else            document.documentElement.classList.remove('dark')
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const auroraColors = isDarkMode ? AURORA_DARK : AURORA_LIGHT

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-primary selection:text-primary-foreground">

      <div className="fixed inset-0 z-[-1]">
        <Aurora
          colorStops={auroraColors}
          blend={isDarkMode ? 0.5 : 0.35}
          amplitude={isDarkMode ? 1.0 : 0.6}
          speed={0.5}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDarkMode
            ? 'bg-background/55'
            : 'bg-background/65'
        }`} />
      </div>

      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Hero />
      <About />
      <Features />
      <Footer />
    </div>
  )
}