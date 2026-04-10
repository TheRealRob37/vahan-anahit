import { useState, useEffect, memo } from 'react'
import FadeIn from './FadeIn'
import { WEDDING_DATE, config } from '../config/wedding'

const { dayNames, monthLabel } = config.copy.calendar
const { days: daysLabel, hours: hoursLabel, minutes: minutesLabel, seconds: secondsLabel } = config.copy.countdown

// Derive calendar grid from the wedding date — works for any month/year
const year = WEDDING_DATE.getFullYear()
const month = WEDDING_DATE.getMonth()
const highlightDay = WEDDING_DATE.getDate()
const daysInMonth = new Date(year, month + 1, 0).getDate()
// Monday-based offset: Sunday(0)→6, Monday(1)→0, …
const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
const CELLS = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

function useCountdown() {
  const calc = () => {
    const diff = WEDDING_DATE.getTime() - Date.now()
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

// Isolated so only this component re-renders every second, not the whole CalendarSection
const Countdown = memo(function Countdown() {
  const countdown = useCountdown()
  if (!countdown) return null
  return (
    <FadeIn delay={0.25}>
      <div className="flex justify-center gap-6 sm:gap-10 mt-10">
        {[
          { value: countdown.days,    label: daysLabel },
          { value: countdown.hours,   label: hoursLabel },
          { value: countdown.minutes, label: minutesLabel },
          { value: countdown.seconds, label: secondsLabel },
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
  )
})

export default function CalendarSection() {
  return (
    <section style={{ backgroundColor: '#faf7f4' }} className="px-6 pt-16 pb-14">
      <div className="max-w-md mx-auto">
        <FadeIn delay={0.15}>
          <div className="w-full max-w-xs mx-auto">
            <p className="text-center font-armenian-serif text-4xl mb-6" style={{ color: 'rgb(74, 44, 26)' }}>{monthLabel}</p>
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs font-armenian-sans text-amber-800/70 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {CELLS.map((day, i) => (
                <div key={i} className="flex items-center justify-center h-8">
                  {day === highlightDay ? (
                    <div className="date-circle font-armenian-serif text-sm font-semibold text-amber-900">{day}</div>
                  ) : day ? (
                    <span className="font-armenian-sans text-sm text-stone-600">{day}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <Countdown />
      </div>
    </section>
  )
}
