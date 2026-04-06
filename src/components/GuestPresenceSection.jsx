import FadeIn from './FadeIn'
import MusicPlayer from './MusicPlayer'

export default function GuestPresenceSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 py-10">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-armenian-sans text-stone-600 text-sm leading-relaxed mb-8">
            Ձեր ներկայությունը մեզ համար
            ամենաթանկ նվերն է,
            որով այս օրը կդառնա առավել լուսավոր և հիշարժան։
          </p>
          <MusicPlayer />
        </FadeIn>
      </div>
    </section>
  )
}
