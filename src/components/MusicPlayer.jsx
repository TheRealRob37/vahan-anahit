import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const SRC = `${import.meta.env.BASE_URL}Frank Sinatra (Фрэнк Синатра) - My Way.mp3`

function useAutoplay(audioRef, setPlaying) {
  useEffect(() => {
    const audio = audioRef.current
    audio.muted = true
    audio.play().then(() => {
      setPlaying(true)
      // Unmute on first user interaction
      const unmute = () => {
        audio.muted = false
        window.removeEventListener('click', unmute)
        window.removeEventListener('touchstart', unmute)
        window.removeEventListener('keydown', unmute)
        window.removeEventListener('scroll', unmute)
      }
      window.addEventListener('click', unmute)
      window.addEventListener('touchstart', unmute)
      window.addEventListener('keydown', unmute)
      window.addEventListener('scroll', unmute)
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

function VinylPlayer() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  useAutoplay(audioRef, setPlaying)

  useEffect(() => {
    const audio = audioRef.current
    const onEnded = () => setPlaying(false)
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  const toggle = () => {
    if (playing) { audioRef.current.pause() } else { audioRef.current.play() }
    setPlaying(!playing)
  }

  return (
    <div className="flex items-center justify-center">
      <audio ref={audioRef} src={SRC} preload="auto" />
      <button onClick={toggle} className="relative focus:outline-none" aria-label="Play">
        {/* Vinyl disc */}
        <motion.div
          animate={{ rotate: playing ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatType: 'loop' }}
          style={{ willChange: 'transform' }}
          className="w-20 h-20 rounded-full"
        >
          {/* Outer ring */}
          <div className="w-full h-full rounded-full" style={{
            background: 'conic-gradient(from 0deg, #1a1008, #3a2010, #1a1008, #2a1810, #1a1008)',
            boxShadow: '0 0 0 2px rgba(200,160,60,0.3), 0 4px 20px rgba(0,0,0,0.6)'
          }}>
            {/* Grooves */}
            {[28, 36, 44, 52, 60].map(s => (
              <div key={s} className="absolute rounded-full border border-white/5" style={{
                width: s, height: s,
                top: (80 - s) / 2, left: (80 - s) / 2
              }} />
            ))}
            {/* Center label */}
            <div className="absolute rounded-full flex items-center justify-center" style={{
              width: 24, height: 24, top: 28, left: 28,
              background: 'radial-gradient(circle, #c9922a, #8b5e10)',
              boxShadow: '0 0 6px rgba(200,140,30,0.6)'
            }}>
              <div className="w-2 h-2 rounded-full bg-black/60" />
            </div>
          </div>
        </motion.div>

        {/* Play/pause overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}>
            {playing ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="3" height="8" rx="1" fill="rgba(255,220,100,0.9)" />
                <rect x="6" y="1" width="3" height="8" rx="1" fill="rgba(255,220,100,0.9)" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 1.5l7 3.5-7 3.5V1.5z" fill="rgba(255,220,100,0.9)" />
              </svg>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}

function FullPlayer() {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useAutoplay(audioRef, setPlaying)

  useEffect(() => {
    const audio = audioRef.current
    const update = () => setProgress(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => { setPlaying(false); setProgress(0) }
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', update)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const toggle = () => {
    if (playing) { audioRef.current.pause() } else { audioRef.current.play() }
    setPlaying(!playing)
  }

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * duration
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="max-w-xs mx-auto flex flex-col items-center gap-4">
      <audio ref={audioRef} src={SRC} preload="auto" />
      <div className="text-center">
        <p className="font-armenian-serif text-amber-900 text-base tracking-wide">My Way</p>
        <p className="font-armenian-sans text-stone-400 text-xs mt-0.5">Frank Sinatra</p>
      </div>
      <button onClick={toggle}
        className="w-14 h-14 rounded-full border-2 border-amber-800/40 flex items-center justify-center hover:border-amber-800 hover:bg-amber-800/5 transition-all duration-300">
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="2" width="4" height="14" rx="1.5" fill="#92400e" />
            <rect x="11" y="2" width="4" height="14" rx="1.5" fill="#92400e" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 3l11 6-11 6V3z" fill="#92400e" />
          </svg>
        )}
      </button>
      <div className="w-full flex items-center gap-2">
        <span className="font-armenian-sans text-xs text-stone-400 w-8 text-right">{fmt(progress)}</span>
        <div className="flex-1 h-1 bg-stone-200 rounded-full cursor-pointer relative" onClick={seek}>
          <div className="absolute left-0 top-0 h-full bg-amber-800/60 rounded-full transition-all"
            style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
        </div>
        <span className="font-armenian-sans text-xs text-stone-400 w-8">{fmt(duration)}</span>
      </div>
    </div>
  )
}

export default function MusicPlayer({ vinyl = false }) {
  return vinyl ? <VinylPlayer /> : <FullPlayer />
}
