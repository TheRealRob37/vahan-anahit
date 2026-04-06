export default function MapLink({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-armenian-sans text-xs text-amber-800 border border-amber-800/30 rounded-full px-3 py-1.5 hover:bg-amber-800 hover:text-white transition-colors duration-300"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      Տեսնել քարտեզում
    </a>
  )
}
