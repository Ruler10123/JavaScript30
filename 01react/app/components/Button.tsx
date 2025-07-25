'use client'

import { useState, useEffect, useRef } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  type: 'explosion' | 'trail' | 'sparkle'
}

interface FlyingEffect {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  type: 'lightning' | 'star' | 'comet'
  life: number
  size: number
}

interface ScreenShake {
  x: number
  y: number
  intensity: number
}

export default function Button() {
  const [clickCount, setClickCount] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [flyingEffects, setFlyingEffects] = useState<FlyingEffect[]>([])
  const [buttonText, setButtonText] = useState('SPAM ME!')
  const [buttonSize, setButtonSize] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [screenShake, setScreenShake] = useState<ScreenShake>({ x: 0, y: 0, intensity: 0 })
  const [rainbowMode, setRainbowMode] = useState(false)
  const [explosionCount, setExplosionCount] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastClickTime = useRef(0)

  const crazyTexts = [
    'SPAM!', 'BOOM!', 'POW!', 'ZAP!', 'WOW!', 'AMAZING!', 'INCREDIBLE!', 
    'FANTASTIC!', 'EPIC!', 'LEGENDARY!', 'MIND-BLOWING!', 'AWESOME!',
    'SPECTACULAR!', 'PHENOMENAL!', 'EXTRAORDINARY!', 'MAGNIFICENT!', 'INSANE!',
    'CRAZY!', 'WILD!', 'BONKERS!', 'NUTS!', 'BANANAS!', 'FIRE!', 'LIT!'
  ]

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#FF1744', '#00E676', '#FF9800', '#9C27B0', '#2196F3'
  ]

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }, [])

  const createExplosion = (x: number, y: number) => {
    const newParticles: Particle[] = []
    const particleCount = 5 + Math.floor(clickCount / 30) * 1 // Much fewer particles
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = 6 + Math.random() * 8
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 2,
        life: 30 + Math.random() * 15,
        type: 'explosion'
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }

  const createLightning = () => {
    const newEffects: FlyingEffect[] = []
    for (let i = 0; i < 1; i++) { // Only 1 lightning bolt per click
      const startX = Math.random() * window.innerWidth
      const startY = Math.random() * window.innerHeight
      const endX = Math.random() * window.innerWidth
      const endY = Math.random() * window.innerHeight
      
      newEffects.push({
        id: Date.now() + i + Math.random(),
        x: startX,
        y: startY,
        vx: (endX - startX) / 20, // Faster movement
        vy: (endY - startY) / 20,
        type: 'lightning',
        life: 25, // Shorter life for faster cleanup
        size: 4 + Math.random() * 3 // Bigger and more visible
      })
    }
    setFlyingEffects(prev => [...prev, ...newEffects])
  }

  const createShootingStar = () => {
    const newEffects: FlyingEffect[] = []
    for (let i = 0; i < 1; i++) {
      newEffects.push({
        id: Date.now() + i + Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        type: 'star',
        life: 35 + Math.random() * 20,
        size: 2 + Math.random() * 2
      })
    }
    setFlyingEffects(prev => [...prev, ...newEffects])
  }

  const createComet = () => {
    const newEffects: FlyingEffect[] = []
    for (let i = 0; i < 1; i++) {
      newEffects.push({
        id: Date.now() + i + Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        type: 'comet',
        life: 40 + Math.random() * 25,
        size: 4 + Math.random() * 3
      })
    }
    setFlyingEffects(prev => [...prev, ...newEffects])
  }

  const playMultiSound = () => {
    if (!audioContextRef.current) return
    
    // Only 1 oscillator for better performance
    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    const baseFreq = 200 + clickCount * 30
    oscillator.frequency.setValueAtTime(baseFreq, audioContextRef.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, audioContextRef.current.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.15, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1)
    
    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.1)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime.current
    lastClickTime.current = now
    
    setClickCount(prev => prev + 1)
    
    // Play sound
    playMultiSound()
    
    // Create explosion at click position
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      createExplosion(x, y)
    }
    
    // Random flying effects
    const effectType = Math.random()
    if (effectType < 0.4) { // Increased lightning chance
      createLightning()
    } else if (effectType < 0.7) {
      createShootingStar()
    } else {
      createComet()
    }
    
    // Random button text
    setButtonText(crazyTexts[Math.floor(Math.random() * crazyTexts.length)])
    
    // Multiple animations
    setButtonSize(1.4)
    setTimeout(() => setButtonSize(1), 100)
    
    setRotation(prev => prev + 720) // Double rotation!
    
    setGlowIntensity(1)
    setTimeout(() => setGlowIntensity(0), 200)
    
    // Screen shake
    const shakeIntensity = Math.min(clickCount / 20, 10) // Much reduced intensity
    setScreenShake({ x: (Math.random() - 0.5) * shakeIntensity, y: (Math.random() - 0.5) * shakeIntensity, intensity: shakeIntensity })
    
    // Rainbow mode after 50 clicks
    if (clickCount >= 49 && !rainbowMode) {
      setRainbowMode(true)
    }
    
    // Explosion counter
    setExplosionCount(prev => prev + 1)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Update particles
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx * 0.15, // Faster movement
          y: particle.y + particle.vy * 0.15,
          vy: particle.vy + 0.2, // Less gravity
          life: particle.life - 1.5, // Faster decay
          size: particle.size * 0.97 // Faster shrink
        })).filter(particle => 
          particle.life > 0 && 
          particle.x > -50 && particle.x < window.innerWidth + 50 && 
          particle.y > -50 && particle.y < window.innerHeight + 50
        )
      )

      // Update flying effects
      setFlyingEffects(prev => 
        prev.map(effect => ({
          ...effect,
          x: effect.x + effect.vx,
          y: effect.y + effect.vy,
          life: effect.life - 1.5, // Faster decay
          size: effect.size * 0.98
        })).filter(effect => 
          effect.life > 0 && 
          effect.x > -50 && effect.x < window.innerWidth + 50 && 
          effect.y > -50 && effect.y < window.innerHeight + 50
        )
      )
    }, 20) // Slightly slower interval for better performance

    return () => clearInterval(interval)
  }, [])

  // Screen shake effect
  useEffect(() => {
    if (screenShake.intensity > 0) {
      const timer = setTimeout(() => {
        setScreenShake({ x: 0, y: 0, intensity: 0 })
      }, 80) // Shorter shake duration
      return () => clearTimeout(timer)
    }
  }, [screenShake])

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 overflow-hidden"
      style={{
        transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
        transition: 'transform 0.03s ease-out' // Faster transition
      }}
    >
      {/* Animated background with even fewer elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => ( // Reduced from 20 to 12
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Rainbow mode background */}
      {rainbowMode && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-20" />
      )}

      {/* Flying Effects */}
      {flyingEffects.map(effect => (
        <div
          key={effect.id}
          className="absolute pointer-events-none"
          style={{
            left: effect.x,
            top: effect.y,
            width: effect.size,
            height: effect.size,
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            opacity: effect.life / 100,
          }}
        >
          {effect.type === 'lightning' && (
            <div 
              className="w-full h-full bg-yellow-300 rounded-full"
              style={{
                boxShadow: `0 0 ${effect.size * 5}px #FFD700, 0 0 ${effect.size * 10}px #FFFF00`,
                filter: 'blur(0.5px)',
                backgroundColor: '#FFFF00'
              }}
            />
          )}
          {effect.type === 'star' && (
            <div 
              className="w-full h-full bg-white rounded-full"
              style={{
                boxShadow: `0 0 ${effect.size * 3}px #FFFFFF`,
                filter: 'blur(0.5px)'
              }}
            />
          )}
          {effect.type === 'comet' && (
            <div 
              className="w-full h-full bg-cyan-400 rounded-full"
              style={{
                boxShadow: `0 0 ${effect.size * 4}px #00FFFF`,
                filter: 'blur(1px)'
              }}
            />
          )}
        </div>
      ))}

      {/* Particles with different styles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            zIndex: 1000,
            opacity: particle.life / 100,
            filter: particle.type === 'sparkle' ? 'blur(1px)' : 'none'
          }}
        />
      ))}

      {/* Main Button */}
      <button 
        ref={buttonRef}
        className="relative w-40 h-40 text-white font-bold text-xl rounded-full transition-all duration-100 cursor-pointer overflow-hidden group z-10"
        style={{
          transform: `scale(${buttonSize}) rotate(${rotation}deg)`,
          background: rainbowMode 
            ? `linear-gradient(45deg, ${colors[clickCount % colors.length]}, ${colors[(clickCount + 1) % colors.length]}, ${colors[(clickCount + 2) % colors.length]})`
            : `linear-gradient(45deg, ${colors[clickCount % colors.length]}, ${colors[(clickCount + 1) % colors.length]})`,
          boxShadow: `0 0 ${30 + glowIntensity * 50}px ${colors[clickCount % colors.length]}`,
          animation: rainbowMode ? 'rainbow 0.5s linear infinite' : 'none'
        }}
        onClick={handleClick}
      >
        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <span className="text-center leading-tight font-black">{buttonText}</span>
        </div>
        
        {/* Multiple animated backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-200 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-4 border-white opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-300 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
        
        {/* Click counter */}
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold animate-bounce">
          {clickCount}
        </div>

        {/* Explosion counter */}
        <div className="absolute -bottom-3 -left-3 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {explosionCount}
        </div>
      </button>

      {/* Floating elements around button */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => ( // Reduced from 8 to 6
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
            style={{
              left: `${50 + 50 * Math.cos(i * Math.PI / 3)}%`,
              top: `${50 + 50 * Math.sin(i * Math.PI / 3)}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        button:hover {
          transform: scale(${buttonSize * 1.2}) rotate(${rotation}deg) !important;
        }
        
        button:active {
          transform: scale(${buttonSize * 0.9}) rotate(${rotation}deg) !important;
        }
      `}</style>
    </div>
  )
}