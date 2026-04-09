import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const dot = { x: useMotionValue(-100), y: useMotionValue(-100) }
  const ring = {
    x: useSpring(dot.x, { stiffness: 120, damping: 18 }),
    y: useSpring(dot.y, { stiffness: 120, damping: 18 }),
  }
  const visible = useRef(false)
  const isPointer = useRef(false)

  useEffect(() => {
    const onMove = (e) => {
      dot.x.set(e.clientX)
      dot.y.set(e.clientY)
      if (!visible.current) visible.current = true
    }

    const onOver = (e) => {
      const el = e.target.closest('a, button, [role="button"], input, select, textarea, label')
      isPointer.current = !!el
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>

      {/* Dot — follows instantly */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: dot.x,
          y: dot.y,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'rgba(201,146,42,0.9)',
        }}
      />

      {/* Ring — follows with spring delay */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: ring.x,
          y: ring.y,
          translateX: '-50%',
          translateY: '-50%',
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(201,146,42,0.5)',
          scale: isPointer.current ? 1.5 : 1,
        }}
      />
    </>
  )
}
