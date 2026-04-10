import FadeIn from './FadeIn'
import { config } from '../config/wedding'

const { invitationLines } = config.copy

export default function InvitationTextSection() {
  return (
    <section style={{ backgroundColor: '#f5f0ea' }} className="px-6 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <FadeIn>
          <p className="font-armenian-serif text-stone-800 text-lg leading-relaxed">
            {invitationLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < invitationLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
