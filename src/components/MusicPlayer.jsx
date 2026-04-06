import { useState, useRef, useEffect } from 'react'

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    const update = () => setProgress(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', () => { setPlaying(false); setProgress(0) })
    return () => {
      audio.removeEventListener('timeupdate', update)
      audio.removeEventListener('loadedmetadata', onLoaded)
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
    <div className="max-w-xs mx-auto">
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}Frank Sinatra (Фрэнк Синатра) - My Way.mp3`} preload="metadata" />

      <div className="flex flex-col items-center gap-4">
        {/* Song info */}
        <div className="text-center">
          <p className="font-armenian-serif text-amber-900 text-base tracking-wide">My Way</p>
          <p className="font-armenian-sans text-stone-400 text-xs mt-0.5">Frank Sinatra</p>
        </div>

        {/* Play button */}
        <button
          onClick={toggle}
          className="w-14 h-14 rounded-full border-2 border-amber-800/40 flex items-center justify-center hover:border-amber-800 hover:bg-amber-800/5 transition-all duration-300"
        >
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

        {/* Progress bar */}
        <div className="w-full flex items-center gap-2">
          <span className="font-armenian-sans text-xs text-stone-400 w-8 text-right">{fmt(progress)}</span>
          <div
            className="flex-1 h-1 bg-stone-200 rounded-full cursor-pointer relative"
            onClick={seek}
          >
            <div
              className="absolute left-0 top-0 h-full bg-amber-800/60 rounded-full transition-all"
              style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
            />
          </div>
          <span className="font-armenian-sans text-xs text-stone-400 w-8">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  )
}
