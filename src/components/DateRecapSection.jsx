import FadeIn from './FadeIn'
import OrnamentDivider from './OrnamentDivider'
import { config } from '../config/wedding'

const { dateNote } = config.copy

export default function DateRecapSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 pb-14">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <OrnamentDivider />
          <p className="font-armenian-sans font-bold text-sm leading-relaxed" style={{ color: 'oklch(45% 0.1 60)' }}>
            {dateNote}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
