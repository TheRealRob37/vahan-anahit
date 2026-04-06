import FadeIn from './FadeIn'
import OrnamentDivider from './OrnamentDivider'

export default function DateRecapSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 pb-14">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <OrnamentDivider />
          <p className="font-armenian-sans font-bold text-sm leading-relaxed" style={{ color: 'oklch(45% 0.1 60)' }}>
            Երեկոն խոստանում է լինել լի ջերմությամբ,
            գեղեցիկ երաժշտությամբ և տոնական տրամադրությամբ։
            Քանի որ այն նախատեսված է մեծահասակների համար՝
            ալկոհոլային հյուրասիրությամբ և ակտիվ երեկոյով,
            սիրով խնդրում ենք այս հատուկ օրը կիսել մեզ հետ առանց երեխաների։
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
