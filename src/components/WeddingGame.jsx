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
const FLOWER_PINK  = 0xff88cc
const FLOWER_LIGHT = 0xffccee

// ── ring types ─────────────────────────────────────────────────────────────
const RING_TYPES = {
  gold:    { color: GOLD,   shine: GOLD_LIGHT,   points: 10, glowColor: 0xffcc44, label: null, weight: 6 },
  silver:  { color: SILVER, shine: SILVER_LIGHT,  points: 15, glowColor: 0xaaddff, label: '✦',  weight: 3 },
  diamond: { color: DIAMOND,shine: DIAMOND_LIGHT, points: 30, glowColor: 0x88eeff, label: '◆',  weight: 1 },
}

// ── constants ─────────────────────────────────────────────────────────────
const LIVES_MAX          = 3
const SPAWN_START        = 1200
const SPAWN_MIN          = 450
const SPEED_START        = 2.0
const SPEED_MAX          = 6.0
const FLOWER_POINTS      = 5000
const FLOWER_WEIGHT      = 0.1
const COMBO_FLOWER_BURST = 50
const FLOWER_BURST_COUNT = 15
// ФИX #1: Жёсткий лимит частиц — никогда не превышаем.
// Без этого на мобиле создавались сотни объектов в секунду → лаги.
const MAX_PARTICLES      = 80

function pickRingType() {
  const total = Object.values(RING_TYPES).reduce((s, t) => s + t.weight, 0) + FLOWER_WEIGHT
  let r = Math.random() * total
  if (r < FLOWER_WEIGHT) return 'flower'
  r -= FLOWER_WEIGHT
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

      // ── аудио ────────────────────────────────────────────────────────────
      // ФИX #2: AudioContext создаётся один раз и переиспользуется.
      // Раньше создавался новый контекст на каждый звук → браузер выдавал ошибку
      // "AudioContext limit exceeded" (особенно на iOS Safari).
      // Replaced by the unified audio block below.
      // ФИX #3: Разблокировка аудио при первом касании.
      // iOS/Android запрещают AudioContext без жеста пользователя.
      // touchstart — первый жест, с которым игрок взаимодействует.
// ── AUDIO (iOS FIXED) ───────────────────────────────────────────

let audioCtx = null
let audioUnlocked = false

function getAudioCtx() {
  return audioCtx
}

// 🔓 разблокировка ТОЛЬКО через user gesture
const unlockAudio = () => {
  if (audioUnlocked) return

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime)

    osc.start()
    osc.stop(audioCtx.currentTime + 0.01)

    audioUnlocked = true
  } catch (e) {}
}

// важно: iOS лучше реагирует и на touch, и на click
container.addEventListener('touchstart', unlockAudio, { once: true })
container.addEventListener('click', unlockAudio, { once: true })

// ── SOUND ENGINE ─────────────────────────────────────────────────

function playTone(freq, type, duration, vol = 0.18, fadeOut = true) {
  try {
    const ctx = getAudioCtx()
    if (!ctx || !audioUnlocked) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = type
    osc.frequency.value = freq

    gain.gain.setValueAtTime(vol, ctx.currentTime)

    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
      )
    }

    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {}
}

// ── SFX ──────────────────────────────────────────────────────────

const sfxCatch = () => {
  playTone(880, 'sine', 0.12, 0.15)
  playTone(1200, 'sine', 0.08, 0.1)
}

const sfxMiss = () => {
  playTone(220, 'sawtooth', 0.18, 0.12)
}

const sfxFlower = () => {
  const notes = [523, 659, 784, 1047]

  notes.forEach((f, i) => {
    setTimeout(() => {
      playTone(f, 'sine', 0.18, 0.2)
    }, i * 60)
  })
}

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

      // ── responsive scaling ───────────────────────────────────────────────
      const scale        = Math.min(1, W / 390)
      const PILLOW_W     = Math.round(110 * scale + 30)
      const PILLOW_H     = Math.round(22 * scale + 6)
      const PILLOW_SPEED = 7 + 3 * scale
      const RING_OUTER   = Math.round(14 * scale + 8)
      const RING_INNER   = Math.round(RING_OUTER * 0.55)
      const FLOWER_R     = Math.round(RING_OUTER * 1.1)

      const onResize = () => app.renderer.resize(container.clientWidth, container.clientHeight)
      window.addEventListener('resize', onResize)

      // ── helpers ──────────────────────────────────────────────────────────
      function makeText(text, style) {
        return new Text({ text, style: { fontFamily: "'Noto Serif Armenian', Georgia, serif", ...style } })
      }

      // ── ФИX #4: Единый менеджер частиц ───────────────────────────────────
      // Раньше каждая частица (trail, sparkle) добавляла свой отдельный тикер
      // через app.ticker.add(). При 20 кольцах на экране → 400+ вызовов тикера
      // в секунду. Теперь ОДИН массив + ОДИН тикер обходит все частицы.
      // Это в 10–20 раз меньше нагрузки на JS движок мобила.
      const particles = []  // { gfx, life, vx, vy, type: 'trail'|'sparkle' }

      function spawnTrail(x, y, color) {
        // ФИX #5: Пропускаем спавн если лимит достигнут
        if (particles.length >= MAX_PARTICLES) return
        const sp = new Graphics()
        sp.circle(0, 0, Math.random() * 2 + 0.5)
        sp.fill({ color, alpha: 0.7 })
        sp.x = x + (Math.random() - 0.5) * RING_OUTER * 1.2
        sp.y = y
        app.stage.addChildAt(sp, 2)
        particles.push({ gfx: sp, life: 0.8, vx: 0, vy: 0.5, type: 'trail' })
      }

      function spawnSparkles(x, y, color = GOLD) {
        // ФИX #6: Убрали GlowFilter с каждой частицы.
        // Раньше: 35 sparkles × new GlowFilter() = 35 WebGL шейдерных программ
        // за одно касание цветка. При бурсте 15 цветков = 525 шейдеров → GPU умирал.
        // Теперь: просто цветные кружки и ромбики — выглядят так же, не убивают GPU.
        const maxNew = MAX_PARTICLES - particles.length
        const want   = color === FLOWER_PINK ? 20 : 12
        const count  = Math.min(want, maxNew)
        for (let i = 0; i < count; i++) {
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
          app.stage.addChild(sp)
          particles.push({
            gfx: sp,
            life: 1,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            type: 'sparkle',
          })
        }
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

      // ── HUD ──────────────────────────────────────────────────────────────
      const scoreLbl = makeText('0', { fontSize: 28, fill: WHITE, fontWeight: 'bold' })
      scoreLbl.x = 20; scoreLbl.y = 14
      scoreLbl.filters = [new GlowFilter({ distance: 8, outerStrength: 1.2, color: GOLD })]
      app.stage.addChild(scoreLbl)

      const HEART_SIZE = 14
      const HEART_GAP  = 22
      const heartGfxList = Array.from({ length: LIVES_MAX }, (_, i) => {
        const h = new Graphics()
        h.x = W - 16 - (LIVES_MAX - 1 - i) * HEART_GAP
        h.y = 22
        app.stage.addChild(h)
        return h
      })

      // ФИX #7: Перерисовываем сердца только когда lives изменились.
      // Раньше drawHearts() вызывался каждый кадр через updateHUD() — лишняя работа.
      let lastDrawnLives = -1
      function drawHearts() {
        if (lives === lastDrawnLives) return
        lastDrawnLives = lives
        heartGfxList.forEach((h, i) => {
          h.clear()
          const full = i < lives
          const s = HEART_SIZE
          h.circle(-s * 0.25, -s * 0.15, s * 0.38)
          h.fill({ color: ROSE, alpha: full ? 1 : 0.2 })
          h.circle( s * 0.25, -s * 0.15, s * 0.38)
          h.fill({ color: ROSE, alpha: full ? 1 : 0.2 })
          h.poly([-s * 0.62, s * 0.1, s * 0.62, s * 0.1, 0, s * 0.72])
          h.fill({ color: ROSE, alpha: full ? 1 : 0.2 })
        })
      }

      const titleTxt = makeText('Բռնիր Մատանիները', { fontSize: 13, fill: GOLD_LIGHT, alpha: 0.5 })
      titleTxt.anchor.set(0.5, 0)
      titleTxt.x = W / 2; titleTxt.y = 9
      app.stage.addChild(titleTxt)

      const comboLbl = makeText('', { fontSize: 15, fill: GOLD_LIGHT, fontWeight: 'bold' })
      comboLbl.anchor.set(0.5, 0)
      comboLbl.x = W / 2; comboLbl.y = 32
      comboLbl.alpha = 0
      app.stage.addChild(comboLbl)

      // ── pillow ───────────────────────────────────────────────────────────
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

      // ФИX #8: Флаги анимации подушки — предотвращают наложение тикеров.
      // Раньше быстрый поймыш нескольких колец запускал несколько одновременных
      // squishPillow() тикеров, которые одновременно вызывали drawPillow() с
      // разными параметрами → подушка мигала и дёргалась.
      let squishing = false
      let flashing  = false

      function flashPillow() {
        if (flashing) return  // уже идёт — не запускаем второй
        flashing = true
        let t = 0
        const tick = (ticker) => {
          t += ticker.deltaTime * 0.07
          drawPillow(t < 0.5 ? 1 - t * 0.25 : 1, 1, t < 0.5 ? 0xff7777 : null)
          if (t >= 1) { app.ticker.remove(tick); drawPillow(); flashing = false }
        }
        app.ticker.add(tick)
      }

      function squishPillow() {
        if (squishing) return  // уже идёт — не запускаем второй
        squishing = true
        let t = 0
        const tick = (ticker) => {
          t += ticker.deltaTime * 0.09
          drawPillow(1 - Math.sin(t * Math.PI) * 0.38, 1 + Math.sin(t * Math.PI) * 0.08)
          if (t >= 1) { app.ticker.remove(tick); drawPillow(); squishing = false }
        }
        app.ticker.add(tick)
      }

      // ── floating score text ──────────────────────────────────────────────
      // ФИX #9: Убрали GlowFilter из floatText.
      // Каждый вызов floatText создавал новый GlowFilter → новый WebGL шейдер.
      // При быстром комбо (поймал 10 колец подряд) = 10 новых шейдеров за секунду.
      // Текст и так читается — жирный, цветной. Шейдер был излишеством.
      function floatText(text, x, y, color = GOLD_LIGHT) {
        const t = makeText(text, { fontSize: 18, fill: color, fontWeight: 'bold' })
        t.anchor.set(0.5)
        t.x = x; t.y = y
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

      // ── flower factory ───────────────────────────────────────────────────
      function makeFlower(xOverride) {
        const g = new Container()
        const gfx = new Graphics()
        const r = FLOWER_R
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2
          const px = Math.cos(angle) * r * 0.65
          const py = Math.sin(angle) * r * 0.65
          gfx.ellipse(px, py, r * 0.45, r * 0.55)
          gfx.fill({ color: FLOWER_PINK, alpha: 0.92 })
        }
        gfx.circle(0, 0, r * 0.35)
        gfx.fill({ color: FLOWER_LIGHT })
        gfx.circle(0, 0, r * 0.18)
        gfx.fill({ color: GOLD_LIGHT })
        g.addChild(gfx)
        const lbl = makeText('✿', { fontSize: Math.round(r * 0.9), fill: WHITE })
        lbl.anchor.set(0.5)
        lbl.alpha = 0.85
        g.addChild(lbl)
        g.filters = [new GlowFilter({ distance: 18, outerStrength: 2.5, color: FLOWER_PINK })]
        g.x = xOverride ?? (r + 12 + Math.random() * (W - (r + 12) * 2))
        g.y = -(r + 10)
        g._isFlower = true
        g._wobble = Math.random() * Math.PI * 2
        g._spin = (Math.random() - 0.5) * 0.04
        return g
      }

      // ── ring factory ─────────────────────────────────────────────────────
      function makeRing(typeName) {
        const type = RING_TYPES[typeName]
        const g = new Container()
        const gfx = new Graphics()
        const mid = (RING_OUTER + RING_INNER) / 2
        const bw  = RING_OUTER - RING_INNER
        gfx.arc(0, 0, mid, Math.PI * 0.2, Math.PI * 0.85)
        gfx.stroke({ color: 0x000000, width: bw, alpha: 0.35, cap: 'butt' })
        gfx.arc(0, 0, mid, 0, Math.PI * 2)
        gfx.stroke({ color: type.color, width: bw - 1, alpha: 1, cap: 'butt' })
        gfx.arc(0, 0, RING_INNER + 1.5, 0, Math.PI * 2)
        gfx.stroke({ color: type.shine, width: 2, alpha: 0.3, cap: 'butt' })
        gfx.arc(0, 0, mid, -Math.PI * 0.95, -Math.PI * 0.25)
        gfx.stroke({ color: type.shine, width: bw * 0.55, alpha: 0.75, cap: 'round' })
        gfx.arc(0, 0, mid, -Math.PI * 0.75, -Math.PI * 0.55)
        gfx.stroke({ color: WHITE, width: bw * 0.3, alpha: 0.55, cap: 'round' })
        gfx.arc(0, 0, mid, Math.PI * 0.6, Math.PI * 0.82)
        gfx.stroke({ color: type.shine, width: bw * 0.25, alpha: 0.3, cap: 'round' })
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
      app.canvas.addEventListener('touchstart',  onTouchStart,  { passive: true })
      app.canvas.addEventListener('touchmove',   onTouchMove,   { passive: true })
      app.canvas.addEventListener('touchend',    onTouchEnd,    { passive: true })
      app.canvas.addEventListener('touchcancel', onTouchEnd,    { passive: true })

      function showGameOver(finalScore) {
        onGameOverRef.current?.(finalScore)
      }

      // ── game state ────────────────────────────────────────────────────────
      let score            = 0
      let lives            = LIVES_MAX
      let rings            = []
      let spawnTimer       = 0
      let spawnInterval    = SPAWN_START
      let fallSpeed        = SPEED_START
      let gameOver         = false
      let combo            = 0
      let comboFadeTimer   = 0
      let lastFlowerBurstAt= 0
      let ringPauseTimer   = 0

      function updateHUD() {
        scoreLbl.text = String(score)
        drawHearts()
        if (combo >= 2) {
          comboLbl.text = `×${combo} combo`
          comboLbl.alpha = 1
          comboFadeTimer = 90
        }
      }
      updateHUD()

      // ── flower burst ──────────────────────────────────────────────────────
      function spawnFlowerBurst(count) {
        // ФИX #10: Защита от деления на ноль.
        // (i / (count - 1)) при count=1 → NaN → цветок улетал за экран.
        if (count < 2) return
        rings = rings.filter(obj => {
          if (!obj._isFlower) { app.stage.removeChild(obj); obj.destroy(); return false }
          return true
        })
        ringPauseTimer = 4000
        for (let i = 0; i < count; i++) {
          const x = (FLOWER_R + 12) + (i / (count - 1)) * (W - (FLOWER_R + 12) * 2)
          const flower = makeFlower(x)
          flower.y = -(FLOWER_R + 10 + i * 18)
          app.stage.addChildAt(flower, 3)
          rings.push(flower)
        }
      }

      // ── main loop ─────────────────────────────────────────────────────────
      app.ticker.add(ticker => {
        const dt = ticker.deltaTime

        // ФИX #4 (продолжение): Единый тикер обновляет ВСЕ частицы.
        // Итерируем с конца чтобы безопасно удалять элементы через splice().
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          if (p.type === 'sparkle') {
            p.gfx.x  += p.vx * dt * 0.8
            p.gfx.y  += (p.vy + (1 - p.life) * 5) * dt * 0.8
            p.life   -= 0.035 * dt
            p.gfx.rotation += 0.1 * dt
          } else {
            // trail
            p.gfx.y  += p.vy * dt
            p.life   -= 0.055 * dt
          }
          p.gfx.alpha = Math.max(0, p.life)
          if (p.life <= 0) {
            app.stage.removeChild(p.gfx)
            p.gfx.destroy()
            particles.splice(i, 1)
          }
        }

        for (const s of twinkleStars) {
          s._phase += s._speed * dt
          s.alpha = 0.2 + Math.abs(Math.sin(s._phase)) * 0.6
        }

        if (comboFadeTimer > 0) {
          comboFadeTimer -= dt
          if (comboFadeTimer <= 0) comboLbl.alpha = 0
        }

        if (gameOver) return

        // pillow movement
        if (keys['ArrowLeft']  || keys['a']) pillowContainer.x = Math.max(PILLOW_W / 2, pillowContainer.x - PILLOW_SPEED * dt)
        if (keys['ArrowRight'] || keys['d']) pillowContainer.x = Math.min(W - PILLOW_W / 2, pillowContainer.x + PILLOW_SPEED * dt)

        // spawn (paused during flower burst)
        if (ringPauseTimer > 0) {
          ringPauseTimer -= ticker.deltaMS
        } else {
          spawnTimer += ticker.deltaMS
          if (spawnTimer >= spawnInterval) {
            spawnTimer = 0
            const typeName = pickRingType()
            const obj = typeName === 'flower' ? makeFlower() : makeRing(typeName)
            app.stage.addChildAt(obj, 3)
            rings.push(obj)
            if (spawnInterval > SPAWN_MIN) spawnInterval = Math.max(SPAWN_MIN, spawnInterval - 10)
            fallSpeed = Math.min(SPEED_MAX, fallSpeed + 0.04)
          }
        }

        // flower burst every ×50 milestone
        const milestone = Math.floor(combo / COMBO_FLOWER_BURST) * COMBO_FLOWER_BURST
        if (combo >= COMBO_FLOWER_BURST && milestone > lastFlowerBurstAt) {
          lastFlowerBurstAt = milestone
          spawnFlowerBurst(FLOWER_BURST_COUNT)
          floatText(`🌸 ×${milestone} COMBO! 🌸`, W / 2, H / 2 - 40, FLOWER_PINK)
        }
        if (combo === 0) lastFlowerBurstAt = 0

        // update rings & flowers
        rings = rings.filter(obj => {
          if (obj._isFlower) {
            obj.y += fallSpeed * 0.7 * dt
            obj._wobble += 0.02 * dt
            obj.rotation += obj._spin * dt
            obj.x += Math.sin(obj._wobble * 1.5) * 0.8 * dt
            // ФИX #5 (продолжение): вероятность трейла снижена + проверка лимита
            if (Math.random() < 0.25 && particles.length < MAX_PARTICLES) {
              spawnTrail(obj.x, obj.y, FLOWER_PINK)
            }
            const glow = obj.filters?.[0]
            if (glow?.outerStrength !== undefined) glow.outerStrength = 2 + Math.sin(obj._wobble * 4) * 0.8

            const inX = Math.abs(obj.x - pillowContainer.x) < PILLOW_W / 2 + FLOWER_R * 0.7
            const inY = obj.y >= pillowContainer.y - PILLOW_H / 2 - FLOWER_R * 0.7 &&
                        obj.y <= pillowContainer.y + PILLOW_H / 2

            if (inX && inY) {
              score += FLOWER_POINTS
              updateHUD()
              sfxFlower()
              spawnSparkles(obj.x, pillowContainer.y, FLOWER_PINK)
              floatText(`+${FLOWER_POINTS} 🌸`, obj.x, pillowContainer.y - 40, FLOWER_PINK)
              squishPillow()
              app.stage.removeChild(obj); obj.destroy()
              return false
            }
            if (obj.y > H + FLOWER_R + 10) {
              app.stage.removeChild(obj); obj.destroy()
              return false
            }
            return true
          }

          // ring
          const speed = obj._typeName === 'diamond' ? fallSpeed * 0.8 : fallSpeed
          obj.y += speed * dt
          obj._wobble += 0.025 * dt
          obj.x += Math.sin(obj._wobble) * obj._wobbleAmp * dt

          // ФИX #5 (продолжение): трейл только если не переполнен пул частиц
          if (Math.random() < 0.25 && particles.length < MAX_PARTICLES) {
            spawnTrail(obj.x, obj.y, obj._type.glowColor)
          }

          const glow = obj.filters?.[0]
          if (glow?.outerStrength !== undefined) glow.outerStrength = 1.2 + Math.sin(obj._wobble * 3) * 0.6

          const inX = Math.abs(obj.x - pillowContainer.x) < PILLOW_W / 2 + RING_OUTER * 0.55
          const inY = obj.y >= pillowContainer.y - PILLOW_H / 2 - RING_OUTER * 0.55 &&
                      obj.y <= pillowContainer.y + PILLOW_H / 2

          if (inX && inY) {
            combo++
            const pts = obj._type.points * combo
            score += pts
            updateHUD()
            sfxCatch()
            spawnSparkles(obj.x, pillowContainer.y, obj._type.glowColor)
            floatText(combo > 1 ? `+${pts} ×${combo}` : `+${pts}`, obj.x, pillowContainer.y - 30, obj._type.glowColor)
            squishPillow()
            app.stage.removeChild(obj); obj.destroy()
            return false
          }

          if (obj.y > H + RING_OUTER + 10) {
            combo = 0
            lives--
            updateHUD()
            sfxMiss()
            flashPillow()
            app.stage.removeChild(obj); obj.destroy()
            if (lives <= 0) { gameOver = true; showGameOver(score) }
            return false
          }
          return true
        })
      })

      app._cleanupExtras = () => {
        window.removeEventListener('resize', onResize)
        container.removeEventListener('touchstart', unlockAudio)
        app.canvas.removeEventListener('touchstart',  onTouchStart)
        app.canvas.removeEventListener('touchmove',   onTouchMove)
        app.canvas.removeEventListener('touchend',    onTouchEnd)
        app.canvas.removeEventListener('touchcancel', onTouchEnd)
        // Очищаем все оставшиеся частицы
        for (const p of particles) { p.gfx.destroy() }
        particles.length = 0
      }
    })()

    return () => {
      destroyed = true
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      // ФИX #11: Правильный вызов destroy для PixiJS v8.
      // Второй аргумент { children: true } в v8 передаётся как options объект.
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
