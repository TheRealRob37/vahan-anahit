export default function GradientDivider({ from, to, height = 80 }) {
  return (
    <div
      style={{
        height,
        background: `linear-gradient(to bottom, ${from}, ${to})`,
        marginTop: -1,
        marginBottom: -1,
      }}
    />
  )
}
