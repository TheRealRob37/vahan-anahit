import FadeIn from './FadeIn'
import SectionHeader from './SectionHeader'

export default function DressCodeAndRulesSection() {
  const swatches = [
    { color: '#4a2c1a', label: 'Շոկոլադագույն' },
    { color: '#6e1a2a', label: 'Բորդո' },
    { color: '#1a1a1a', label: 'Սև' },
    { color: '#1a2a4a', label: 'Մուգ կապույտ' },
    { color: '#0f482c', label: 'Մուգ կանաչ' },
  ]

  return (
    <section style={{ backgroundColor: '#ede8df' }} className="px-6 py-14">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <SectionHeader label="Հագուստ" title="Դրես-կոդ" titleColor="#4a2c1a" />
          <p className="font-armenian-sans text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            Հագուստի գույների ընտրությունը ցանկալի է, բայց ոչ պարտադիր և նախընտրելի գույներն են՝
            շոկոլադագույն, բորդո, սև, մուգ կապույտ և մուգ կանաչ
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