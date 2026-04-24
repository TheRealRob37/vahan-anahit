import { motion } from 'framer-motion'

export default function SideSelector({ options, selectedSide, onSelect }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const isActive = option.value === selectedSide

        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={isActive}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden rounded-[1.5rem] border px-5 py-4 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-700/40 ${
              isActive
                ? 'border-amber-700/70 shadow-lg shadow-amber-900/10'
                : 'border-stone-200 bg-white/75 hover:border-amber-500/40 hover:shadow-md'
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
                option.accentClass
              } ${isActive ? 'opacity-100' : 'opacity-65'}`}
            />

            <div className="relative">
              <h3 className="font-armenian-serif text-xl text-stone-800">
                {option.label}
              </h3>
              <p className="mt-1 font-armenian-sans text-sm leading-relaxed text-stone-500">
                {option.description}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
