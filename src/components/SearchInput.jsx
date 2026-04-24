export default function SearchInput({ value, onChange, disabled = false, inputRef }) {
  return (
    <label className={`block ${disabled ? 'opacity-70' : ''}`}>
      <span className="sr-only">Որոնել հյուրի անունով</span>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
        >
          <path
            d="M21 21L15.8 15.8M17 10.5a6.5 6.5 0 11-13 0a6.5 6.5 0 0113 0Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={disabled ? 'Սկզբում ընտրեք կողմը' : 'Որոնել հյուրի անունով'}
          className="w-full rounded-full border border-stone-200 bg-white/80 py-3.5 pl-12 pr-4 text-sm text-stone-700 placeholder:text-stone-400 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:cursor-not-allowed disabled:bg-stone-100/70"
        />
      </div>
    </label>
  )
}
