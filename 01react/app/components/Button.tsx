'use client'

import { useState, useEffect, useRef } from 'react'

export default function Button() {
  const [clickCount, setClickCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, color: string}>>([])
  const [buttonText, setButtonText] = useState('CLICK ME!')
  const [buttonSize, setButtonSize] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const crazyTexts = [
    'BOOM!', 'POW!', 'ZAP!', 'WOW!', 'AMAZING!', 'INCREDIBLE!', 
    'FANTASTIC!', 'EPIC!', 'LEGENDARY!', 'MIND-BLOWING!', 'AWESOME!',
    'SPECTACULAR!', 'PHENOMENAL!', 'EXTRAORDINARY!', 'MAGNIFICENT!'
  ]

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ]

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
  }, [])

  const createParticles = (x: number, y: number) => {
    const newParticles = []
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }

  const playSound = () => {
    if (!audioContextRef.current) return
    
    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    oscillator.frequency.setValueAtTime(200 + clickCount * 50, audioContextRef.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContextRef.current.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1)
    
    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.1)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isAnimating) return
    
    setIsAnimating(true)
    setClickCount(prev => prev + 1)
    
    // Play sound
    playSound()
    
    // Create particles at click position
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      createParticles(e.clientX - rect.left, e.clientY - rect.top)
    }
    
    // Random button text
    setButtonText(crazyTexts[Math.floor(Math.random() * crazyTexts.length)])
    
    // Size animation
    setButtonSize(1.3)
    setTimeout(() => setButtonSize(1), 150)
    
    // Rotation animation
    setRotation(prev => prev + 360)
    
    // Glow effect
    setGlowIntensity(1)
    setTimeout(() => setGlowIntensity(0), 300)
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles([])
      setIsAnimating(false)
    }, 1000)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx * 0.1,
          y: particle.y + particle.vy * 0.1,
          vy: particle.vy + 0.5 // gravity
        })).filter(particle => 
          particle.x > -50 && particle.x < 300 && 
          particle.y > -50 && particle.y < 300
        )
      )
    }, 16)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px ${particle.color}`,
            zIndex: 1000
          }}
        />
      ))}

      {/* Main Button */}
      <button 
        ref={buttonRef}
        className="relative w-32 h-32 text-white font-bold text-lg rounded-full transition-all duration-300 cursor-pointer overflow-hidden group"
        style={{
          transform: `scale(${buttonSize}) rotate(${rotation}deg)`,
          background: `linear-gradient(45deg, ${colors[clickCount % colors.length]}, ${colors[(clickCount + 1) % colors.length]})`,
          boxShadow: `0 0 ${20 + glowIntensity * 30}px ${colors[clickCount % colors.length]}`,
          animation: isAnimating ? 'shake 0.5s ease-in-out' : 'none'
        }}
        onClick={handleClick}
        disabled={isAnimating}
      >
        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <span className="text-center leading-tight">{buttonText}</span>
        </div>
        
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse" />
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full border-4 border-white opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        
        {/* Click counter */}
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {clickCount}
        </div>
      </button>

      {/* Floating elements around button */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
            style={{
              left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
              top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: scale(${buttonSize}) rotate(${rotation}deg); }
          10%, 30%, 50%, 70%, 90% { transform: scale(${buttonSize}) rotate(${rotation}deg) translateX(-5px); }
          20%, 40%, 60%, 80% { transform: scale(${buttonSize}) rotate(${rotation}deg) translateX(5px); }
        }
        
        button:hover {
          transform: scale(${buttonSize * 1.1}) rotate(${rotation}deg) !important;
        }
      `}</style>
    </div>
  )
}