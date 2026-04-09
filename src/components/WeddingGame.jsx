import { useEffect, useRef } from 'react'

// ── palette ────────────────────────────────────────────────────────────────
const GOLD         = 0xC9922A
const GOLD_LIGHT   = 0xF0D080
const BG           = 0x0d0805
const CREAM        = 0xf5efe3
const ROSE         = 0xdc8888
const WHITE        = 0xffffff
const SILVER       = 0xC0C0C0
const SILVER_LIGHT = 0xE8E8E8
const DIAMOND      = 0x88ccff
const DIAMOND_LIGHT= 0xcceeFF

// ── ring types ─────────────────────────────────────────────────────────────
const RING_TYPES = {
  gold:    { color: GOLD,   shine: GOLD_LIGHT,   points: 10, glowColor: 0xffcc44, label: null, weight: 6 },
  silver:  { color: SILVER, shine: SILVER_LIGHT,  points: 15, glowColor: 0xaaddff, label: '✦',  weight: 3 },
  diamond: { color: DIAMOND,shine: DIAMOND_LIGHT, points: 30, glowColor: 0x88eeff, label: '◆',  weight: 1 },
}

// ── constants ──────────────────────────────────────────────────────────────
const PILLOW_W     = 120
const PILLOW_H     = 24
const PILLOW_SPEED = 8
const RING_OUTER   = 18
const RING_INNER   = 10
const LIVES_MAX    = 3
const SPAWN_START  = 1200
const SPAWN_MIN    = 450
const SPEED_START  = 2.0
const SPEED_MAX    = 6.0

function pickRingType() {
  const total = Object.values(RING_TYPES).reduce((s, t) => s + t.weight, 0)
  let r = Math.random() * total
  for (const [name, t] of Object.entries(RING_TYPES)) {
    r -= t.weight
    if (r <= 0) return name
  }
  return 'gold'
}

export default function WeddingGame({ onGameOver }) {
  const containerRef = useRef(null)
  const onGameOverRef = useRef(onGameOver)
  onGameOverRef.current = onGameOver

  useEffect(() => {
    let destroyed = false
    const container = containerRef.current
    if (!container) return

    let app = null
    const keys = {}
    const onKeyDown = e => { keys[e.key] = true }
    const onKeyUp   = e => { keys[e.key] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    ;(async () => {
      const { Application, Graphics, Text, Container, BlurFilter } = await import('pixi.js')
      const { GlowFilter, DropShadowFilter } = await import('pixi-filters')
      if (destroyed) return

      app = new Application()
      await app.init({
        width:           container.clientWidth,
        height:          container.clientHeight,
        backgroundColor: BG,
        antialias:       true,
        resolution:      Math.min(window.devicePixelRatio || 1, 2),
        autoDensity:     true,
      })
      if (destroyed) { app.destroy(true); return }

      container.appendChild(app.canvas)
      const W = app.screen.width
      const H = app.screen.height

      const onResize = () => app.renderer.resize(container.clientWidth, container.clientHeight)
      window.addEventListener('resize', onResize)

      // ── helpers ─────────────────────────────────────────────────────────
      function makeText(text, style) {
        return new Text({ text, style: { fontFamily: "'Noto Serif Armenian', Georgia, serif", ...style } })
      }

      // ── background ───────────────────────────────────────────────────────
      const bgGlow = new Graphics()
      bgGlow.ellipse(W / 2, H + 80, W * 0.7, 220)
      bgGlow.fill({ color: 0x3a1a00, alpha: 0.6 })
      bgGlow.filters = [new BlurFilter({ strength: 60 })]
      app.stage.addChild(bgGlow)

      const starGfx = new Graphics()
      for (let i = 0; i < 120; i++) {
        const x    = Math.random() * W
        const y    = Math.random() * H * 0.85
        const r    = Math.random() * 1.2 + 0.2
        const gold = Math.random() > 0.7
        starGfx.circle(x, y, r)
        starGfx.fill({ color: gold ? GOLD_LIGHT : WHITE, alpha: Math.random() * 0.55 + 0.1 })
      }
      app.stage.addChild(starGfx)

      const twinkleStars = []
      for (let i = 0; i < 18; i++) {
        const s = new Graphics()
        s.circle(0, 0, Math.random() * 1.4 + 0.5)
        s.fill({ color: Math.random() > 0.5 ? GOLD_LIGHT : WHITE })
        s.x = Math.random() * W
        s.y = Math.random() * H * 0.8
        s.alpha = Math.random()
        s._phase = Math.random() * Math.PI * 2
        s._speed = 0.02 + Math.random() * 0.03
        app.stage.addChild(s)
        twinkleStars.push(s)
      }

      const floorGlow = new Graphics()
      floorGlow.ellipse(W / 2, H - 30, W * 0.75, 60)
      floorGlow.fill({ color: GOLD, alpha: 0.06 })
      floorGlow.filters = [new BlurFilter({ strength: 20 })]
      app.stage.addChild(floorGlow)

      // ── HUD ─────────────────────────────────────────────────────────────
      const scoreLbl = makeText('0', { fontSize: 28, fill: WHITE, fontWeight: 'bold' })
      scoreLbl.x = 20; scoreLbl.y = 14
      scoreLbl.filters = [new GlowFilter({ distance: 8, outerStrength: 1.2, color: GOLD })]
      app.stage.addChild(scoreLbl)

      const livesTxt = makeText('', { fontSize: 18, fill: ROSE })
      livesTxt.anchor.set(1, 0)
      livesTxt.x = W - 16; livesTxt.y = 16
      app.stage.addChild(livesTxt)

      const titleTxt = makeText('Բռնիր Մատանիները', { fontSize: 13, fill: GOLD_LIGHT, alpha: 0.5 })
      titleTxt.anchor.set(0.5, 0)
      titleTxt.x = W / 2; titleTxt.y = 9
      app.stage.addChild(titleTxt)

      const comboLbl = makeText('', { fontSize: 15, fill: GOLD_LIGHT, fontWeight: 'bold' })
      comboLbl.anchor.set(0.5, 0)
      comboLbl.x = W / 2; comboLbl.y = 32
      comboLbl.alpha = 0
      app.stage.addChild(comboLbl)

      // ── pillow ──────────────────────────────────────────────────────────
      const pillowContainer = new Container()
      const pillow = new Graphics()
      pillowContainer.addChild(pillow)
      pillowContainer.x = W / 2
      pillowContainer.y = H - 52
      app.stage.addChild(pillowContainer)

      const pillowGlow = new Graphics()
      pillowGlow.ellipse(0, 4, PILLOW_W * 0.6, 12)
      pillowGlow.fill({ color: GOLD, alpha: 0.18 })
      pillowGlow.filters = [new BlurFilter({ strength: 10 })]
      pillowContainer.addChildAt(pillowGlow, 0)

      function drawPillow(squishY = 1, squishX = 1, flashColor = null) {
        pillow.clear()
        const pw = PILLOW_W * squishX
        const ph = PILLOW_H * squishY
        pillow.roundRect(-pw / 2 + 4, -ph / 2 + 5, pw - 8, ph, 12)
        pillow.fill({ color: 0x000000, alpha: 0.3 })
        const bodyColor = flashColor ?? CREAM
        pillow.roundRect(-pw / 2, -ph / 2, pw, ph, 12)
        pillow.fill({ color: bodyColor })
        pillow.roundRect(-pw / 2 + 6, -ph / 2 + 4, pw - 12, ph / 2 - 4, 8)
        pillow.fill({ color: WHITE, alpha: 0.22 })
        pillow.roundRect(-pw / 2 + 4, -ph / 2 + 3, pw - 8, ph - 6, 9)
        pillow.stroke({ color: GOLD, width: 1.4, alpha: 0.55 })
        pillow.poly([0, -6 * squishY, 6, 0, 0, 6 * squishY, -6, 0])
        pillow.fill({ color: GOLD })
        pillow.poly([0, -6 * squishY, 6, 0, 0, 6 * squishY, -6, 0])
        pillow.stroke({ color: GOLD_LIGHT, width: 1, alpha: 0.8 })
      }
      drawPillow()
      pillow.filters = [new DropShadowFilter({ offset: { x: 0, y: 4 }, blur: 8, alpha: 0.4, color: 0x000000 })]

      // ── ring factory ────────────────────────────────────────────────────
      function makeRing(typeName) {
        const type = RING_TYPES[typeName]
        const g = new Container()
        const gfx = new Graphics()

        gfx.circle(0, 0, RING_OUTER)
        gfx.fill({ color: type.color })
        gfx.circle(0, 0, RING_INNER)
        gfx.fill({ color: BG })
        gfx.arc(0, 0, (RING_OUTER + RING_INNER) / 2, -Math.PI * 0.9, -Math.PI * 0.35)
        gfx.stroke({ color: type.shine, width: 3.5, alpha: 0.85, cap: 'round' })
        gfx.arc(0, 0, (RING_OUTER + RING_INNER) / 2, Math.PI * 0.6, Math.PI * 0.75)
        gfx.stroke({ color: type.shine, width: 2, alpha: 0.4, cap: 'round' })
        g.addChild(gfx)

        if (type.label) {
          const lbl = makeText(type.label, { fontSize: 8, fill: type.shine })
          lbl.anchor.set(0.5)
          g.addChild(lbl)
        }

        g.filters = [new GlowFilter({ distance: 14, outerStrength: typeName === 'diamond' ? 2.5 : 1.5, color: type.glowColor })]
        g.x = RING_OUTER + 12 + Math.random() * (W - (RING_OUTER + 12) * 2)
        g.y = -(RING_OUTER + 10)
        g._typeName = typeName
        g._type = type
        g._wobble = Math.random() * Math.PI * 2
        g._wobbleAmp = (Math.random() - 0.5) * 1.2
        return g
      }

      // ── trail particles ──────────────────────────────────────────────────
      function spawnTrail(x, y, color) {
        const sp = new Graphics()
        sp.circle(0, 0, Math.random() * 2 + 0.5)
        sp.fill({ color, alpha: 0.7 })
        sp.x = x + (Math.random() - 0.5) * RING_OUTER * 1.2
        sp.y = y
        let life = 0.8
        app.stage.addChildAt(sp, 2)
        const tick = (ticker) => {
          life -= 0.055 * ticker.deltaTime
          sp.alpha = Math.max(0, life)
          sp.y += 0.5 * ticker.deltaTime
          if (life <= 0) { app.ticker.remove(tick); app.stage.removeChild(sp); sp.destroy() }
        }
        app.ticker.add(tick)
      }

      // ── sparkle burst ─────────────────────────────────────────────────────
      function spawnSparkles(x, y, color = GOLD) {
        for (let i = 0; i < 18; i++) {
          const sp = new Graphics()
          const r = Math.random() * 4 + 1
          if (Math.random() > 0.5) {
            sp.poly([0, -r * 1.2, r, 0, 0, r * 1.2, -r, 0])
            sp.fill({ color: Math.random() > 0.5 ? color : GOLD_LIGHT })
          } else {
            sp.circle(0, 0, r)
            sp.fill({ color: Math.random() > 0.5 ? color : WHITE, alpha: 0.9 })
          }
          sp.x = x + (Math.random() - 0.5) * PILLOW_W * 0.9
          sp.y = y + (Math.random() - 0.5) * PILLOW_H
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 5 + 2
          const vx = Math.cos(angle) * speed
          const vy = Math.sin(angle) * speed - 3
          let life = 1
          sp.filters = [new GlowFilter({ distance: 6, outerStrength: 1, color })]
          app.stage.addChild(sp)
          const tick = (ticker) => {
            sp.x  += vx * ticker.deltaTime * 0.8
            sp.y  += (vy + (1 - life) * 5) * ticker.deltaTime * 0.8
            life  -= 0.035 * ticker.deltaTime
            sp.alpha = Math.max(0, life)
            sp.rotation += 0.1 * ticker.deltaTime
            if (life <= 0) { app.ticker.remove(tick); app.stage.removeChild(sp); sp.destroy() }
          }
          app.ticker.add(tick)
        }
      }

      // ── floating score text ──────────────────────────────────────────────
      function floatText(text, x, y, color = GOLD_LIGHT) {
        const t = makeText(text, { fontSize: 18, fill: color, fontWeight: 'bold' })
        t.anchor.set(0.5)
        t.x = x; t.y = y
        t.filters = [new GlowFilter({ distance: 8, outerStrength: 1.5, color })]
        app.stage.addChild(t)
        let life = 1
        const tick = (ticker) => {
          life -= 0.025 * ticker.deltaTime
          t.y  -= 1.2 * ticker.deltaTime
          t.alpha = Math.max(0, life)
          t.scale.set(1 + (1 - life) * 0.3)
          if (life <= 0) { app.ticker.remove(tick); app.stage.removeChild(t); t.destroy() }
        }
        app.ticker.add(tick)
      }

      // ── pillow reactions ─────────────────────────────────────────────────
      function flashPillow() {
        let t = 0
        const tick = (ticker) => {
          t += ticker.deltaTime * 0.07
          drawPillow(t < 0.5 ? 1 - t * 0.25 : 1, 1, t < 0.5 ? 0xff7777 : null)
          if (t >= 1) { app.ticker.remove(tick); drawPillow() }
        }
        app.ticker.add(tick)
      }

      function squishPillow() {
        let t = 0
        const tick = (ticker) => {
          t += ticker.deltaTime * 0.09
          drawPillow(1 - Math.sin(t * Math.PI) * 0.38, 1 + Math.sin(t * Math.PI) * 0.08)
          if (t >= 1) { app.ticker.remove(tick); drawPillow() }
        }
        app.ticker.add(tick)
      }

      // ── touch controls ────────────────────────────────────────────────────
      let lastTouchX = null
      const onTouchStart = e => { lastTouchX = e.touches[0].clientX }
      const onTouchMove  = e => {
        if (lastTouchX === null) return
        const dx = e.touches[0].clientX - lastTouchX
        pillowContainer.x = Math.max(PILLOW_W / 2, Math.min(W - PILLOW_W / 2, pillowContainer.x + dx))
        lastTouchX = e.touches[0].clientX
      }
      const onTouchEnd = () => { lastTouchX = null }
      app.canvas.addEventListener('touchstart', onTouchStart, { passive: true })
      app.canvas.addEventListener('touchmove',  onTouchMove,  { passive: true })
      app.canvas.addEventListener('touchend',   onTouchEnd,   { passive: true })

      // ── game over overlay ─────────────────────────────────────────────────
      function showGameOver(finalScore) {
        onGameOverRef.current?.(finalScore)
      }

      // ── game state ────────────────────────────────────────────────────────
      let score         = 0
      let lives         = LIVES_MAX
      let rings         = []
      let spawnTimer    = 0
      let spawnInterval = SPAWN_START
      let fallSpeed     = SPEED_START
      let gameOver      = false
      let combo         = 0
      let comboFadeTimer= 0

      function updateHUD() {
        scoreLbl.text = String(score)
        livesTxt.text = '♥'.repeat(lives) + '♡'.repeat(LIVES_MAX - lives)
        if (combo >= 2) {
          comboLbl.text = `×${combo} combo`
          comboLbl.alpha = 1
          comboFadeTimer = 90
        }
      }
      updateHUD()

      // ── main loop ─────────────────────────────────────────────────────────
      app.ticker.add(ticker => {
        const dt = ticker.deltaTime

        // twinkle stars
        for (const s of twinkleStars) {
          s._phase += s._speed * dt
          s.alpha = 0.2 + Math.abs(Math.sin(s._phase)) * 0.6
        }

        // combo label fade
        if (comboFadeTimer > 0) {
          comboFadeTimer -= dt
          if (comboFadeTimer <= 0) comboLbl.alpha = 0
        }

        if (gameOver) return

        // move pillow
        if (keys['ArrowLeft']  || keys['a']) pillowContainer.x = Math.max(PILLOW_W / 2, pillowContainer.x - PILLOW_SPEED * dt)
        if (keys['ArrowRight'] || keys['d']) pillowContainer.x = Math.min(W - PILLOW_W / 2, pillowContainer.x + PILLOW_SPEED * dt)

        // spawn
        spawnTimer += ticker.deltaMS
        if (spawnTimer >= spawnInterval) {
          spawnTimer = 0
          const typeName = pickRingType()
          const ring = makeRing(typeName)
          app.stage.addChildAt(ring, 3)
          rings.push(ring)
          if (spawnInterval > SPAWN_MIN) spawnInterval = Math.max(SPAWN_MIN, spawnInterval - 10)
          fallSpeed = Math.min(SPEED_MAX, fallSpeed + 0.04)
        }

        // update rings
        rings = rings.filter(ring => {
          const speed = ring._typeName === 'diamond' ? fallSpeed * 0.8 : fallSpeed
          ring.y += speed * dt
          ring._wobble += 0.025 * dt
          ring.x += Math.sin(ring._wobble) * ring._wobbleAmp * dt

          // trail
          if (Math.random() < 0.35) spawnTrail(ring.x, ring.y, ring._type.glowColor)

          // pulse glow
          const glow = ring.filters?.[0]
          if (glow?.outerStrength !== undefined) {
            glow.outerStrength = 1.2 + Math.sin(ring._wobble * 3) * 0.6
          }

          const inX = Math.abs(ring.x - pillowContainer.x) < PILLOW_W / 2 + RING_OUTER * 0.55
          const inY = ring.y >= pillowContainer.y - PILLOW_H / 2 - RING_OUTER * 0.55 &&
                      ring.y <= pillowContainer.y + PILLOW_H / 2

          if (inX && inY) {
            combo++
            const multiplier = Math.min(combo, 8)
            const pts = ring._type.points * multiplier
            score += pts
            updateHUD()
            spawnSparkles(ring.x, pillowContainer.y, ring._type.glowColor)
            floatText(combo > 1 ? `+${pts} ×${multiplier}` : `+${pts}`, ring.x, pillowContainer.y - 30, ring._type.glowColor)
            squishPillow()
            app.stage.removeChild(ring); ring.destroy()
            return false
          }

          if (ring.y > H + RING_OUTER + 10) {
            combo = 0
            lives--
            updateHUD()
            flashPillow()
            app.stage.removeChild(ring); ring.destroy()
            if (lives <= 0) { gameOver = true; showGameOver(score) }
            return false
          }
          return true
        })
      })

      app._cleanupExtras = () => {
        window.removeEventListener('resize', onResize)
        app.canvas.removeEventListener('touchstart', onTouchStart)
        app.canvas.removeEventListener('touchmove',  onTouchMove)
        app.canvas.removeEventListener('touchend',   onTouchEnd)
      }
    })()

    return () => {
      destroyed = true
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      if (app) { app._cleanupExtras?.(); app.destroy(true, { children: true }) }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  )
}
