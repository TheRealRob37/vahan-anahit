import FadeIn from './FadeIn'

const GROUPS = [
  {
    venue: 'Սուրբ Հռիփսիմե եկեղեցի, Էջմիածին',
    mapsUrl: 'https://yandex.com/maps/org/35208500744/?ll=44.309617%2C40.167003&z=16',
    items: [
      { time: '14:45', title: 'Պսակադրություն' },
    ],
  },
  {
    venue: '«Արիա» ռեստորան, Երևան',
    mapsUrl: 'https://yandex.com/maps/org/1709327076/?ll=44.576119%2C40.190755&z=16.26',
    items: [
      { time: '17:00', title: 'Ամուսնության գրանցում' },
      { time: '18:00', title: 'Հարսանեկան ընթրիք' },
    ],
  },
]

export default function ProgramSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="space-y-6 sm:space-y-8 md:space-y-10">
          {GROUPS.map((group, gi) => (
            <FadeIn key={group.venue} delay={0.15 * (gi + 1)}>
              <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="space-y-4 sm:space-y-5 mb-4">
                  {group.items.map((item, ii) => (
                    <div key={item.time} className={ii > 0 ? 'pt-4 border-t border-amber-100/60' : ''}>
                      <p className="font-armenian-sans text-xs sm:text-sm text-amber-700 font-medium tracking-wider mb-0.5">Ժամը {item.time}</p>
                      <h4 className="font-armenian-serif text-xl sm:text-2xl md:text-3xl text-stone-800 leading-tight">{item.title}</h4>
                      {item.subtitle && <p className="font-armenian-sans text-sm text-stone-500 mt-1">{item.subtitle}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-amber-100/60">
                  <p className="font-armenian-sans text-sm text-stone-500">{group.venue}</p>
                  <a
                    href={group.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-armenian-sans text-xs text-amber-800 border border-amber-800/30 rounded-full px-3 py-1.5 hover:bg-amber-800 hover:text-white transition-colors duration-300 flex-shrink-0 ml-3"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Քարտեզ
                  </a>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
