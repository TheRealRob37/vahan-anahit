import OrnamentDivider from './OrnamentDivider'

export default function SectionHeader({ label, title, center = true, titleColor }) {
  return (
    <>
      <p className={`font-armenian-sans text-amber-700/60 text-xs tracking-[0.25em] uppercase mb-1 ${center ? 'text-center' : ''}`}>
        {label}
      </p>
      <h2
        className={`font-armenian-serif text-3xl mb-2 ${center ? 'text-center' : ''}`}
        style={{ color: titleColor || '#1c1917' }}
      >
        {title}
      </h2>
      <OrnamentDivider />
    </>
  )
}
