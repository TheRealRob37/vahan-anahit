import FadeIn from './FadeIn'

export default function CalendarSection() {
  const days = ['Երկ', 'Երք', 'Չոր', 'Հինգ', 'Ուրբ', 'Շաբ', 'Կիր']
  const startDay = 2 // April 1, 2026 is Wednesday
  const totalDays = 30
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)

  return (
    <section style={{ backgroundColor: '#faf7f4' }} className="px-6 py-14">
      <div className="max-w-md mx-auto">
        <FadeIn delay={0.15}>
          <div className="w-full max-w-xs mx-auto">
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
      </div>
    </section>
  )
}
