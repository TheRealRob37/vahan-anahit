import FadeIn from './FadeIn'

export default function InvitationTextSection() {
  return (
    <section style={{ backgroundColor: '#f5f0ea' }} className="px-6 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <FadeIn>
          <p className="font-armenian-serif text-stone-800 text-lg leading-relaxed">
            Սիրով հրավիրում ենք Ձեզ<br />
            կիսելու մեր կյանքի ամենակարևոր և երջանիկ օրը,<br />
            երբ մենք կասենք մեր ամենասսպասված "այո"-ն։
          </p>
        </FadeIn>
      </div>
    </section>
  )
}