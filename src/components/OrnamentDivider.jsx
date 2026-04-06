export default function OrnamentDivider() {
  return (
    <div className="flex items-center gap-3 my-6 justify-center">
      <div className="h-px w-16 bg-amber-800/30" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C10 2 12 6 16 6C12 6 16 10 16 10C16 10 12 10 10 14C8 10 4 10 4 10C4 10 8 6 4 6C8 6 10 2 10 2Z" fill="#8b6f4e" opacity="0.6"/>
      </svg>
      <div className="h-px w-16 bg-amber-800/30" />
    </div>
  )
}
