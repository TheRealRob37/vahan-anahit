import { motion } from 'framer-motion'

export default function FooterSection() {
  return (
    <footer className="text-center py-14 px-6" style={{ backgroundColor: '#2c2118' }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="font-armenian-serif text-white/80 text-2xl font-light mb-2">
          Վահան & Անահիտ
        </h3>
        <p className="font-armenian-sans text-amber-200/40 text-xs tracking-widest mb-6">
          25 · 04 · 2026
        </p>
        <div className="h-px w-16 bg-amber-200/20 mx-auto mb-6" />
        <p className="font-armenian-sans text-amber-200/40 text-xs leading-relaxed">
          Շնորհակալ ենք Ձեր ըմբռնման,<br />
          սիրո և մեզ հետ այս օրը կիսելու պատրաստակամության համար։
        </p>
      </motion.div>
    </footer>
  )
}
