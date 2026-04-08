import { memo } from 'react'

const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.8,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 2,
  gold: Math.random() > 0.75,
}))

const Stars = memo(function Stars() {
  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              backgroundColor: s.gold ? 'rgba(201,146,42,0.9)' : 'rgba(255,255,255,0.8)',
              animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </>
  )
})

export default Stars
