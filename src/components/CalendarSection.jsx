import { useState, useEffect } from 'react'
import FadeIn from './FadeIn'

const WEDDING = new Date('2026-04-25T15:00:00+04:00')

function useCountdown() {
  const calc = () => {
    const diff = WEDDING - Date.now()
    if (diff <= 0) return null
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function CalendarSection() {
  const days = ['Երկ', 'Երք', 'Չոր', 'Հինգ', 'Ուրբ', 'Շաբ', 'Կիր']
  const startDay = 2 // April 1, 2026 is Wednesday
  const totalDays = 30
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)

  const countdown = useCountdown()

  return (
    <section style={{ backgroundColor: '#faf7f4' }} className="px-6 py-14">
      <div className="max-w-md mx-auto">
        <FadeIn delay={0.15}>
          <div className="w-full max-w-xs mx-auto">
            <p className="text-center font-armenian-serif text-2xl text-amber-900/80 mb-3">Ապրիլ 2026</p>
            <div className="grid grid-cols-7 mb-2">
              {days.map(d => (
                <div key={d} className="text-center text-xs font-armenian-sans text-amber-800/70 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => (
                <div key={i} className="flex items-center justify-center h-8">
                  {day === 25 ? (
                    <div className="date-circle font-armenian-serif text-sm font-semibold text-amber-900">{day}</div>
                  ) : day ? (
                    <span className="font-armenian-sans text-sm text-stone-600">{day}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {countdown && (
          <FadeIn delay={0.25}>
            <div className="flex justify-center gap-6 sm:gap-10 mt-10">
              {[
                { value: countdown.days,    label: 'օր' },
                { value: countdown.hours,   label: 'ժամ' },
                { value: countdown.minutes, label: 'րոպե' },
                { value: countdown.seconds, label: 'վայրկ' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-armenian-serif text-amber-900 tabular-nums" style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', fontWeight: 300, lineHeight: 1 }}>
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="font-armenian-sans text-stone-400 mt-1 uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
