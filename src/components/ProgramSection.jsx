import FadeIn from './FadeIn'
import MapLink from './MapLink'

export default function ProgramSection() {
  const events = [
    {
      time: '15:00',
      title: 'Պսակադրություն',
      venue: 'Սուրբ Հռիփսիմե եկեղեցի, Էջմիածին',
      address: 'Վաղարշապատ, Հայաստան',
      mapsUrl: 'https://maps.google.com/?q=Saint+Hripsime+Church+Vagharshapat',
    },
    {
      time: '17:00',
      title: 'Հարսանեկան ընթրիք',
      venue: '«Արիա» ռեստորան',
      address: 'Երևան, Հայաստան',
      mapsUrl: 'https://maps.google.com/?q=Restaurant+Aria+Yerevan',
    },
  ]

  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="space-y-6 sm:space-y-8 md:space-y-10">
          {events.map((event, i) => (
            <FadeIn key={event.title} delay={0.1 * (i + 1)}>
              <p className="font-armenian-sans text-xs sm:text-sm text-amber-700 font-medium tracking-wider mb-1 sm:mb-2">Ժամը {event.time}</p>
              <h4 className="font-armenian-serif text-xl sm:text-2xl md:text-3xl text-stone-800 leading-tight mb-3 sm:mb-4">{event.title}</h4>
              <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <p className="font-armenian-sans text-base sm:text-lg md:text-lg text-stone-700 font-medium mb-3 sm:mb-4 leading-relaxed">{event.venue}</p>
                <div className="flex justify-end">
                  <MapLink url={event.mapsUrl} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
