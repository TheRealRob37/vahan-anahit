import { Link } from 'react-router-dom'
import FadeIn from './FadeIn'

export default function GuestPresenceSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 py-6 md:py-10">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-armenian-sans text-stone-600 text-sm leading-relaxed">
            Ձեր ներկայությունը մեզ համար
            ամենաթանկ նվերն է,
            որով այս օրը կդառնա առավել լուսավոր և հիշարժան։
          </p>

          <div className="mt-6">
            <Link
              to="/seating"
              className="inline-flex items-center gap-2 rounded-full border border-amber-800/25 bg-white/70 px-5 py-2.5 font-armenian-sans text-xs text-amber-900 shadow-sm transition-all duration-300 hover:border-amber-800/45 hover:bg-white hover:shadow-md"
            >
              <span>Սեղանների դասավորություն</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
