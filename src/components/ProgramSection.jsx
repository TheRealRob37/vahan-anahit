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
      time: '18:00',
      title: 'Հարսանեկան ընթրիք',
      venue: '«Արիա» ռեստորան',
      address: 'Երևան, Հայաստան',
      mapsUrl: 'https://maps.google.com/?q=Restaurant+Aria+Yerevan',
    },
  ]

  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 py-14">
      <div className="max-w-md mx-auto">
        <div className="space-y-8">
          {events.map((event, i) => (
            <FadeIn key={event.title} delay={0.1 * (i + 1)}>
              <p className="font-armenian-sans text-sm text-amber-700 font-medium tracking-wider mb-1">Ժամը {event.time}</p>
              <h4 className="font-armenian-serif text-2xl text-stone-800 leading-tight">{event.title}</h4>
              <p className="font-armenian-sans text-base text-stone-500 mt-1 mb-3">{event.venue}</p>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-100 shadow-sm">
                <p className="font-armenian-sans text-sm text-stone-500 mb-2">{event.address}</p>
                <MapLink url={event.mapsUrl} />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
