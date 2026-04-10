import FadeIn from './FadeIn'
import { config } from '../config/wedding'

const guestPresenceLines = config.copy.guestPresence.split('\n')

export default function GuestPresenceSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 py-6 md:py-10">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-armenian-sans text-stone-600 text-sm leading-relaxed">
            {guestPresenceLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < guestPresenceLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
