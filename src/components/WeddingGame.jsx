import { useEffect, useRef } from 'react'

// ── palette ────────────────────────────────────────────────────────────────
const GOLD       = 0xC9922A
const GOLD_LIGHT = 0xE4C482
const GOLD_DARK  = 0x8a6010
const BG         = 0x1a0e06
const CREAM      = 0xf5efe3
const ROSE       = 0xdc8888
const WHITE      = 0xffffff

// ── constants ──────────────────────────────────────────────────────────────
const PILLOW_W      = 114
const PILLOW_H      = 26
const PILLOW_SPEED  = 7
const RING_OUTER    = 20
const RING_INNER    = 11
const LIVES_MAX     = 3
const SPAWN_START   = 1300  // ms between rings initially
const SPAWN_MIN     = 500
const SPEED_START   = 2.2
const SPEED_MAX     = 6.5

export default function WeddingGame() {
  const containerRef = useRef(null)

  useEffect(() => {
    let destroyed = false
    const container = containerRef.current
    if (!container) return

    let app = null

    // keyboard state
    const keys = {}
    const onKeyDown = e => { keys[e.key] = true }
    const onKeyUp   = e => { keys[e.key] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    ;(async () => {
      const { Application, Graphics, Text, Container, Assets } = await import('pixi.js')
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

      // ── resize handler ──────────────────────────────────────────────────
      const onResize = () => {
        app.renderer.resize(container.clientWidth, container.clientHeight)
      }
      window.addEventListener('resize', onResize)

      // ── helpers ─────────────────────────────────────────────────────────
      function makeText(text, style) {
        return new Text({ text, style: { fontFamily: "'Noto Serif Armenian', Georgia, serif", ...style } })
      }

      // ── background stars ────────────────────────────────────────────────
      const starGfx = new Graphics()
      for (let i = 0; i < 70; i++) {
        const x    = Math.random() * W
        const y    = Math.random() * H
        const r    = Math.random() * 1.3 + 0.3
        const gold = Math.random() > 0.75
        starGfx.circle(x, y, r)
        starGfx.fill({ color: gold ? GOLD_LIGHT : WHITE, alpha: Math.random() * 0.5 + 0.2 })
      }
      app.stage.addChild(starGfx)

      // ── top bar ─────────────────────────────────────────────────────────
      const scoreLbl = makeText('', { fontSize: 26, fill: WHITE, fontWeight: 'bold' })
      scoreLbl.x = 20; scoreLbl.y = 12
      app.stage.addChild(scoreLbl)

      const livesTxt = makeText('', { fontSize: 20, fill: ROSE })
      livesTxt.anchor.set(1, 0)
      livesTxt.x = W - 16; livesTxt.y = 14
      app.stage.addChild(livesTxt)

      const titleTxt = makeText('Բռնիր Մատանիները', { fontSize: 14, fill: GOLD_LIGHT, alpha: 0.55 })
      titleTxt.anchor.set(0.5, 0)
      titleTxt.x = W / 2; titleTxt.y = 8
      app.stage.addChild(titleTxt)

      // ── pillow ──────────────────────────────────────────────────────────
      const pillow = new Graphics()
      function drawPillow(squish = 1) {
        pillow.clear()
        // shadow
        pillow.roundRect(-PILLOW_W / 2 + 3, -PILLOW_H / 2 * squish + 4, PILLOW_W - 6, PILLOW_H * squish, 12)
        pillow.fill({ color: 0x000000, alpha: 0.25 })
        // body
        pillow.roundRect(-PILLOW_W / 2, -PILLOW_H / 2 * squish, PILLOW_W, PILLOW_H * squish, 12)
        pillow.fill({ color: CREAM })
        // lace border
        pillow.roundRect(-PILLOW_W / 2 + 5, -PILLOW_H / 2 * squish + 4, PILLOW_W - 10, PILLOW_H * squish - 8, 8)
        pillow.stroke({ color: GOLD, width: 1.5, alpha: 0.5 })
        // center gem
        pillow.poly([0, -7 * squish, 7, 0, 0, 7 * squish, -7, 0])
        pillow.fill({ color: GOLD })
        pillow.poly([0, -7 * squish, 7, 0, 0, 7 * squish, -7, 0])
        pillow.stroke({ color: GOLD_LIGHT, width: 1, alpha: 0.7 })
      }
      drawPillow()
      pillow.x = W / 2
      pillow.y = H - 55
      app.stage.addChild(pillow)

      // ── ring factory ─────────────────────────────────────────────────────
      function makeRing() {
        const g = new Graphics()
        // outer circle
        g.circle(0, 0, RING_OUTER)
        g.fill({ color: GOLD })
        // inner hole
        g.circle(0, 0, RING_INNER)
        g.fill({ color: BG })
        // shine arc
        g.arc(0, 0, (RING_OUTER + RING_INNER) / 2, -Math.PI * 0.85, -Math.PI * 0.4)
        g.stroke({ color: GOLD_LIGHT, width: 3, alpha: 0.75, cap: 'round' })
        g.x = RING_OUTER + 10 + Math.random() * (W - (RING_OUTER + 10) * 2)
        g.y = -(RING_OUTER + 5)
        return g
      }

      // ── sparkle burst ────────────────────────────────────────────────────
      function spawnSparkles(x, y) {
        for (let i = 0; i < 12; i++) {
          const sp = new Graphics()
          const r = Math.random() * 3 + 1
          sp.circle(0, 0, r)
          sp.fill({ color: Math.random() > 0.5 ? GOLD : GOLD_LIGHT })
          sp.x = x + (Math.random() - 0.5) * PILLOW_W * 0.8
          sp.y = y + (Math.random() - 0.5) * PILLOW_H
          const vx = (Math.random() - 0.5) * 5
          const vy = -(Math.random() * 5 + 2)
          let life = 1
          app.stage.addChildAt(sp, 1)
          const tick = (ticker) => {
            sp.x  += vx
            sp.y  += vy + (1 - life) * 4
            life  -= 0.04 * ticker.deltaTime
            sp.alpha = Math.max(0, life)
            if (life <= 0) {
              app.ticker.remove(tick)
              app.stage.removeChild(sp)
              sp.destroy()
            }
          }
          app.ticker.add(tick)
        }
      }

      // ── miss flash ───────────────────────────────────────────────────────
      function flashPillow() {
        const orig = CREAM
        let t = 0
        const tick = (ticker) => {
          t += ticker.deltaTime * 0.08
          const lerpColor = t < 0.5 ? 0xff6666 : orig
          drawPillow(t < 0.5 ? 1 - t * 0.3 : 1)
          if (t >= 1) { app.ticker.remove(tick); drawPillow() }
        }
        app.ticker.add(tick)
      }

      // ── pillow squish on catch ───────────────────────────────────────────
      function squishPillow() {
        let t = 0
        const tick = (ticker) => {
          t += ticker.deltaTime * 0.1
          const s = 1 - Math.sin(t * Math.PI) * 0.35
          drawPillow(s)
          if (t >= 1) { app.ticker.remove(tick); drawPillow() }
        }
        app.ticker.add(tick)
      }

      // ── touch controls ───────────────────────────────────────────────────
      let lastTouchX = null
      const onTouchStart = e => { lastTouchX = e.touches[0].clientX }
      const onTouchMove  = e => {
        if (lastTouchX === null) return
        const dx = e.touches[0].clientX - lastTouchX
        pillow.x = Math.max(PILLOW_W / 2, Math.min(W - PILLOW_W / 2, pillow.x + dx))
        lastTouchX = e.touches[0].clientX
      }
      const onTouchEnd = () => { lastTouchX = null }
      app.canvas.addEventListener('touchstart', onTouchStart, { passive: true })
      app.canvas.addEventListener('touchmove',  onTouchMove,  { passive: true })
      app.canvas.addEventListener('touchend',   onTouchEnd,   { passive: true })

      // ── game over overlay ─────────────────────────────────────────────────
      let gameOverContainer = null
      function showGameOver(finalScore) {
        if (gameOverContainer) return
        gameOverContainer = new Container()

        const dim = new Graphics()
        dim.rect(0, 0, W, H)
        dim.fill({ color: 0x000000, alpha: 0.55 })
        gameOverContainer.addChild(dim)

        const card = new Graphics()
        const cw = Math.min(280, W - 40)
        card.roundRect(-cw / 2, -100, cw, 200, 22)
        card.fill({ color: BG, alpha: 0.97 })
        card.stroke({ color: GOLD, width: 2 })
        card.x = W / 2; card.y = H / 2
        gameOverContainer.addChild(card)

        const over = makeText('Խաղն ավարտվեց', { fontSize: 20, fill: GOLD_LIGHT })
        over.anchor.set(0.5); over.x = W / 2; over.y = H / 2 - 68
        gameOverContainer.addChild(over)

        const scoreFinal = makeText(`Հաշիվ: ${finalScore}`, { fontSize: 32, fill: WHITE, fontWeight: 'bold' })
        scoreFinal.anchor.set(0.5); scoreFinal.x = W / 2; scoreFinal.y = H / 2 - 20
        gameOverContainer.addChild(scoreFinal)

        // restart button
        const btn = new Graphics()
        btn.roundRect(-55, -17, 110, 34, 10)
        btn.fill({ color: GOLD })
        btn.x = W / 2; btn.y = H / 2 + 50
        btn.eventMode = 'static'; btn.cursor = 'pointer'
        btn.on('pointerover',  () => { btn.clear(); btn.roundRect(-55,-17,110,34,10); btn.fill({ color: GOLD_LIGHT }) })
        btn.on('pointerout',   () => { btn.clear(); btn.roundRect(-55,-17,110,34,10); btn.fill({ color: GOLD }) })
        btn.on('pointerdown',  () => restartGame())
        gameOverContainer.addChild(btn)

        const btnTxt = makeText('Նորից', { fontSize: 17, fill: BG, fontWeight: 'bold' })
        btnTxt.anchor.set(0.5); btnTxt.x = W / 2; btnTxt.y = H / 2 + 50
        gameOverContainer.addChild(btnTxt)

        app.stage.addChild(gameOverContainer)
      }

      // ── game state ────────────────────────────────────────────────────────
      let score         = 0
      let lives         = LIVES_MAX
      let rings         = []
      let spawnTimer    = 0
      let spawnInterval = SPAWN_START
      let fallSpeed     = SPEED_START
      let gameOver      = false
      let ringsCaught   = 0

      function updateHUD() {
        scoreLbl.text = String(score)
        livesTxt.text = '♥'.repeat(lives) + '♡'.repeat(LIVES_MAX - lives)
      }
      updateHUD()

      function restartGame() {
        if (gameOverContainer) {
          app.stage.removeChild(gameOverContainer)
          gameOverContainer.destroy({ children: true })
          gameOverContainer = null
        }
        rings.forEach(r => { app.stage.removeChild(r); r.destroy() })
        rings         = []
        score         = 0
        lives         = LIVES_MAX
        spawnTimer    = 0
        spawnInterval = SPAWN_START
        fallSpeed     = SPEED_START
        gameOver      = false
        ringsCaught   = 0
        updateHUD()
      }

      // ── main loop ─────────────────────────────────────────────────────────
      app.ticker.add(ticker => {
        if (gameOver) return
        const dt = ticker.deltaTime // ≈1 @ 60fps

        // move pillow
        if (keys['ArrowLeft']  || keys['a']) pillow.x = Math.max(PILLOW_W / 2, pillow.x - PILLOW_SPEED * dt)
        if (keys['ArrowRight'] || keys['d']) pillow.x = Math.min(W - PILLOW_W / 2, pillow.x + PILLOW_SPEED * dt)

        // spawn
        spawnTimer += ticker.deltaMS
        if (spawnTimer >= spawnInterval) {
          spawnTimer = 0
          const ring = makeRing()
          app.stage.addChildAt(ring, 1)
          rings.push(ring)
          // ramp difficulty
          if (spawnInterval > SPAWN_MIN)  spawnInterval = Math.max(SPAWN_MIN, spawnInterval - 12)
          fallSpeed = Math.min(SPEED_MAX, fallSpeed + 0.05)
        }

        // update rings
        rings = rings.filter(ring => {
          ring.y += fallSpeed * dt
          // slight wobble
          ring.rotation += 0.01 * dt

          const inX   = Math.abs(ring.x - pillow.x) < PILLOW_W / 2 + RING_OUTER * 0.6
          const inY   = ring.y >= pillow.y - PILLOW_H / 2 - RING_OUTER * 0.6 && ring.y <= pillow.y + PILLOW_H / 2
          if (inX && inY) {
            // ✓ caught
            ringsCaught++
            score += 10 + Math.floor(fallSpeed)   // bonus for speed
            updateHUD()
            spawnSparkles(ring.x, pillow.y)
            squishPillow()
            app.stage.removeChild(ring); ring.destroy()
            return false
          }
          if (ring.y > H + RING_OUTER + 10) {
            // ✗ missed
            lives--
            updateHUD()
            flashPillow()
            app.stage.removeChild(ring); ring.destroy()
            if (lives <= 0) {
              gameOver = true
              showGameOver(score)
            }
            return false
          }
          return true
        })
      })

      // cleanup fn stored so it can run on destroy
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
      if (app) {
        app._cleanupExtras?.()
        app.destroy(true, { children: true })
      }
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
