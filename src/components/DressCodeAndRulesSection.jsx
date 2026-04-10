import FadeIn from './FadeIn'
import SectionHeader from './SectionHeader'
import { config } from '../config/wedding'

const { sectionLabel, sectionTitle, description } = config.copy.dressCode
const swatches = config.dressCode.swatches

export default function DressCodeAndRulesSection() {
  return (
    <section style={{ backgroundColor: '#ede8df' }} className="px-6 py-14">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <SectionHeader label={sectionLabel} title={sectionTitle} titleColor="#4a2c1a" />
          <p className="font-armenian-sans text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            {swatches.map(s => (
              <div
                key={s.label}
                role="img"
                aria-label={s.label}
                title={s.label}
                className="w-10 h-10 rounded-full shadow-md border border-white/60"
                style={{ backgroundColor: s.color }}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
