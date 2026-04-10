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
  gold:    { color: GOLD,    shine: GOLD_LIGHT,    points: 10, glowColor: 0xffcc44, label: null, weight: 6 },
  silver:  { color: SILVER,  shine: SILVER_LIGHT,  points: 15, glowColor: 0xaaddff, label: '✦',  weight: 3 },
  diamond: { color: DIAMOND, shine: DIAMOND_LIGHT, points: 30, glowColor: 0x88eeff, label: '◆',  weight: 1 },
}

// ── power-up types ─────────────────────────────────────────────────────────
// duration: 0 = instant (heart)
const POWERUP_TYPES = {
  magnet: { emoji: '🧲', color: 0xaa44ff, duration: 6000, weight: 0.12 },
  slow:   { emoji: '⏳', color: 0x44ccff, duration: 5000, weight: 0.12 },
  double: { emoji: '×2', color: 0xffdd00, duration: 7000, weight: 0.10 },
  heart:  { emoji: '❤️', color: 0xff4466, duration: 0,    weight: 0.08 },
}

// ── spawn tables ───────────────────────────────────────────────────────────
const RING_SPAWN    = Object.entries(RING_TYPES).map(([subtype, t]) => ({ type: 'ring', subtype, weight: t.weight }))
const FLOWER_SPAWN  = [{ type: 'flower', subtype: 'flower', weight: 0.1 }]
const POWERUP_SPAWN = Object.entries(POWERUP_TYPES).map(([subtype, t]) => ({ type: 'powerup', subtype, weight: t.weight }))
const POWERUP_COOLDOWN = 9000  // ms between power-up spawns

function pickEntityType(canSpawnPowerup) {
  const table = [...RING_SPAWN, ...FLOWER_SPAWN, ...(canSpawnPowerup ? POWERUP_SPAWN : [])]
  const total  = table.reduce((s, e) => s + e.weight, 0)
  let r = Math.random() * total
  for (const entry of table) { r -= entry.weight; if (r <= 0) return entry }
  return RING_SPAWN[0]
}

// ── game constants ─────────────────────────────────────────────────────────
const LIVES_MAX          = 3
const SPAWN_START        = 1200
const SPAWN_MIN          = 450
const SPEED_START        = 2.0
const SPEED_MAX          = 6.0
const FLOWER_POINTS      = 5000
const COMBO_FLOWER_BURST = 50
const FLOWER_BURST_COUNT = 15
const MAX_PARTICLES      = 80
const MAGNET_FORCE       = 8   // max pixels/frame attraction at pillow center

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

      // ── audio ─────────────────────────────────────────────────────────────
      let audioCtx = null
      function getAudioCtx() {
        if (!audioCtx || audioCtx.state === 'closed') audioCtx = new AudioContext()
        if (audioCtx.state === 'suspended') audioCtx.resume()
        return audioCtx
      }
      const unlockAudio = () => { try { getAudioCtx() } catch {} }
      container.addEventListener('touchstart', unlockAudio, { once: true, passive: true })

      function playTone(freq, type, duration, vol = 0.18) {
        try {
          const ctx  = getAudioCtx()
          const osc  = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.type = type; osc.frequency.value = freq
          gain.gain.setValueAtTime(vol, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
          osc.start(); osc.stop(ctx.currentTime + duration)
        } catch {}
      }
      const sfxCatch   = () => { playTone(880,'sine',0.12,0.15); playTone(1200,'sine',0.08,0.1) }
      const sfxMiss    = () => { playTone(220,'sawtooth',0.18,0.12) }
      const sfxFlower  = () => { [523,659,784,1047].forEach((f,i) => setTimeout(()=>playTone(f,'sine',0.18,0.2),i*60)) }
      const sfxPowerup = () => { [500,700,1000].forEach((f,i) => setTimeout(()=>playTone(f,'sine',0.12,0.22),i*55)) }

      // ── app init ──────────────────────────────────────────────────────────
      app = new Application()
      await app.init({
        width: container.clientWidth, height: container.clientHeight,
        backgroundColor: BG, antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true,
      })
      if (destroyed) { app.destroy(true); return }

      container.appendChild(app.canvas)
      const W = app.screen.width
      const H = app.screen.height

      const onResize = () => app.renderer.resize(container.clientWidth, container.clientHeight)
      window.addEventListener('resize', onResize)

      // ── responsive scaling ────────────────────────────────────────────────
      const scale        = Math.min(1, W / 390)
      const PILLOW_W     = Math.round(110 * scale + 30)
      const PILLOW_H     = Math.round(22 * scale + 6)
      const PILLOW_SPEED = 7 + 3 * scale
      const RING_OUTER   = Math.round(14 * scale + 8)
      const RING_INNER   = Math.round(RING_OUTER * 0.55)
      const FLOWER_R     = Math.round(RING_OUTER * 1.1)
      const PU_R         = Math.round(RING_OUTER * 1.25)
      const MAGNET_RADIUS= W * 0.44

      // ── helpers ───────────────────────────────────────────────────────────
      function makeText(text, style) {
        return new Text({ text, style: { fontFamily: "'Noto Serif Armenian', Georgia, serif", ...style } })
      }

      // ── particle system — one array, one ticker ───────────────────────────
      const particles = []

      function spawnTrail(x, y, color) {
        if (particles.length >= MAX_PARTICLES) return
        const sp = new Graphics()
        sp.circle(0, 0, Math.random() * 2 + 0.5)
        sp.fill({ color, alpha: 0.7 })
        sp.x = x + (Math.random() - 0.5) * RING_OUTER * 1.2; sp.y = y
        app.stage.addChildAt(sp, 2)
        particles.push({ gfx: sp, life: 0.8, vx: 0, vy: 0.5, type: 'trail' })
      }

      function spawnSparkles(x, y, color = GOLD) {
        const count = Math.min(color === FLOWER_PINK ? 20 : 12, MAX_PARTICLES - particles.length)
        for (let i = 0; i < count; i++) {
          const sp = new Graphics(); const r = Math.random() * 4 + 1
          if (Math.random() > 0.5) {
            sp.poly([0,-r*1.2, r,0, 0,r*1.2, -r,0]); sp.fill({ color: Math.random()>0.5 ? color : GOLD_LIGHT })
          } else {
            sp.circle(0,0,r); sp.fill({ color: Math.random()>0.5 ? color : WHITE, alpha: 0.9 })
          }
          sp.x = x + (Math.random()-0.5)*PILLOW_W*0.9; sp.y = y + (Math.random()-0.5)*PILLOW_H
          const angle = Math.random()*Math.PI*2; const speed = Math.random()*5+2
          app.stage.addChild(sp)
          particles.push({ gfx: sp, life: 1, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed-3, type: 'sparkle' })
        }
      }

      // ── background ────────────────────────────────────────────────────────
      const bgGlow = new Graphics()
      bgGlow.ellipse(W/2, H+80, W*0.7, 220); bgGlow.fill({ color: 0x3a1a00, alpha: 0.6 })
      bgGlow.filters = [new BlurFilter({ strength: 60 })]; app.stage.addChild(bgGlow)

      const starGfx = new Graphics()
      for (let i = 0; i < 120; i++) {
        starGfx.circle(Math.random()*W, Math.random()*H*0.85, Math.random()*1.2+0.2)
        starGfx.fill({ color: Math.random()>0.7 ? GOLD_LIGHT : WHITE, alpha: Math.random()*0.55+0.1 })
      }
      app.stage.addChild(starGfx)

      const twinkleStars = []
      for (let i = 0; i < 18; i++) {
        const s = new Graphics()
        s.circle(0, 0, Math.random()*1.4+0.5); s.fill({ color: Math.random()>0.5 ? GOLD_LIGHT : WHITE })
        s.x = Math.random()*W; s.y = Math.random()*H*0.8
        s.alpha = Math.random(); s._phase = Math.random()*Math.PI*2; s._speed = 0.02+Math.random()*0.03
        app.stage.addChild(s); twinkleStars.push(s)
      }

      const floorGlow = new Graphics()
      floorGlow.ellipse(W/2, H-30, W*0.75, 60); floorGlow.fill({ color: GOLD, alpha: 0.06 })
      floorGlow.filters = [new BlurFilter({ strength: 20 })]; app.stage.addChild(floorGlow)

      // ── HUD: score + hearts + title + combo ───────────────────────────────
      const scoreLbl = makeText('0', { fontSize: 28, fill: WHITE, fontWeight: 'bold' })
      scoreLbl.x = 20; scoreLbl.y = 14
      scoreLbl.filters = [new GlowFilter({ distance: 8, outerStrength: 1.2, color: GOLD })]
      app.stage.addChild(scoreLbl)

      const HEART_SIZE = 14; const HEART_GAP = 22
      const heartGfxList = Array.from({ length: LIVES_MAX }, (_, i) => {
        const h = new Graphics()
        h.x = W - 16 - (LIVES_MAX-1-i)*HEART_GAP; h.y = 22; app.stage.addChild(h); return h
      })

      let lastDrawnLives = -1
      function drawHearts() {
        if (lives === lastDrawnLives) return
        lastDrawnLives = lives
        heartGfxList.forEach((h, i) => {
          h.clear(); const full = i < lives; const s = HEART_SIZE
          h.circle(-s*0.25,-s*0.15,s*0.38); h.fill({ color: ROSE, alpha: full?1:0.2 })
          h.circle( s*0.25,-s*0.15,s*0.38); h.fill({ color: ROSE, alpha: full?1:0.2 })
          h.poly([-s*0.62,s*0.1, s*0.62,s*0.1, 0,s*0.72]); h.fill({ color: ROSE, alpha: full?1:0.2 })
        })
      }

      const titleTxt = makeText('Բռնիր մատանիները', { fontSize: 13, fill: GOLD_LIGHT, alpha: 0.5 })
      titleTxt.anchor.set(0.5,0); titleTxt.x = W/2; titleTxt.y = 9; app.stage.addChild(titleTxt)

      const comboLbl = makeText('', { fontSize: 15, fill: GOLD_LIGHT, fontWeight: 'bold' })
      comboLbl.anchor.set(0.5,0); comboLbl.x = W/2; comboLbl.y = 32; comboLbl.alpha = 0; app.stage.addChild(comboLbl)

      // ── effect HUD ────────────────────────────────────────────────────────
      // 3 badges (magnet/slow/double) centered below combo.
      // Heart is instant — no bar needed.
      // Key trick: progress bar uses scale.x only — zero redraw, zero GPU work.
      const HUD_KEYS  = ['magnet', 'slow', 'double']
      const BAR_W     = 22
      const effectHUD = {}

      HUD_KEYS.forEach((key, i) => {
        const cfg  = POWERUP_TYPES[key]
        const cont = new Container()
        cont.x = W/2 + (i-1)*54; cont.y = 56; cont.alpha = 0

        const bg = new Graphics()
        bg.roundRect(-24,-11,48,22,6); bg.fill({ color: cfg.color, alpha: 0.15 })
        bg.roundRect(-24,-11,48,22,6); bg.stroke({ color: cfg.color, width: 1, alpha: 0.5 })
        cont.addChild(bg)

        const icon = makeText(cfg.emoji, { fontSize: 13 })
        icon.anchor.set(0.5); icon.x = -12; icon.y = 0; cont.addChild(icon)

        const track = new Graphics()
        track.roundRect(0,-3,BAR_W,6,3); track.fill({ color: 0x222222, alpha: 0.5 }); cont.addChild(track)

        const fill = new Graphics()
        fill.roundRect(0,-3,BAR_W,6,3); fill.fill({ color: cfg.color }); cont.addChild(fill)

        app.stage.addChild(cont)
        effectHUD[key] = { cont, fill }
      })

      // ── pillow ────────────────────────────────────────────────────────────
      const pillowContainer = new Container()
      const pillow = new Graphics()
      pillowContainer.addChild(pillow); pillowContainer.x = W/2; pillowContainer.y = H-52
      app.stage.addChild(pillowContainer)

      const pillowGlow = new Graphics()
      pillowGlow.ellipse(0,4,PILLOW_W*0.6,12); pillowGlow.fill({ color: GOLD, alpha: 0.18 })
      pillowGlow.filters = [new BlurFilter({ strength: 10 })]; pillowContainer.addChildAt(pillowGlow,0)

      function drawPillow(squishY=1, squishX=1, flashColor=null) {
        pillow.clear()
        const pw=PILLOW_W*squishX; const ph=PILLOW_H*squishY
        pillow.roundRect(-pw/2+4,-ph/2+5,pw-8,ph,12); pillow.fill({ color:0x000000,alpha:0.3 })
        pillow.roundRect(-pw/2,-ph/2,pw,ph,12); pillow.fill({ color: flashColor??CREAM })
        pillow.roundRect(-pw/2+6,-ph/2+4,pw-12,ph/2-4,8); pillow.fill({ color:WHITE,alpha:0.22 })
        pillow.roundRect(-pw/2+4,-ph/2+3,pw-8,ph-6,9); pillow.stroke({ color:GOLD,width:1.4,alpha:0.55 })
        pillow.poly([0,-6*squishY,6,0,0,6*squishY,-6,0]); pillow.fill({ color:GOLD })
        pillow.poly([0,-6*squishY,6,0,0,6*squishY,-6,0]); pillow.stroke({ color:GOLD_LIGHT,width:1,alpha:0.8 })
      }
      drawPillow()
      pillow.filters = [new DropShadowFilter({ offset:{x:0,y:4},blur:8,alpha:0.4,color:0x000000 })]

      let squishing = false; let flashing = false

      function flashPillow(color=0xff7777) {
        if (flashing) return; flashing=true; let t=0
        const tick = tkr => {
          t += tkr.deltaTime*0.07
          drawPillow(t<0.5?1-t*0.25:1, 1, t<0.5?color:null)
          if (t>=1) { app.ticker.remove(tick); drawPillow(); flashing=false }
        }
        app.ticker.add(tick)
      }

      function squishPillow() {
        if (squishing) return; squishing=true; let t=0
        const tick = tkr => {
          t += tkr.deltaTime*0.09
          drawPillow(1-Math.sin(t*Math.PI)*0.38, 1+Math.sin(t*Math.PI)*0.08)
          if (t>=1) { app.ticker.remove(tick); drawPillow(); squishing=false }
        }
        app.ticker.add(tick)
      }

      function floatText(text, x, y, color=GOLD_LIGHT) {
        const t = makeText(text, { fontSize:18, fill:color, fontWeight:'bold' })
        t.anchor.set(0.5); t.x=x; t.y=y; app.stage.addChild(t)
        let life=1
        const tick = tkr => {
          life -= 0.025*tkr.deltaTime; t.y -= 1.2*tkr.deltaTime
          t.alpha = Math.max(0,life); t.scale.set(1+(1-life)*0.3)
          if (life<=0) { app.ticker.remove(tick); app.stage.removeChild(t); t.destroy() }
        }
        app.ticker.add(tick)
      }

      // ── entity factories ──────────────────────────────────────────────────
      // Each factory returns { type, subtype, gfx, wobble, wobbleAmp, spin }
      // gfx.x / gfx.y are the authoritative position — do not duplicate.

      function makeRing(subtype) {
        const cfg=RING_TYPES[subtype]; const g=new Container(); const gfx=new Graphics()
        const mid=(RING_OUTER+RING_INNER)/2; const bw=RING_OUTER-RING_INNER
        gfx.arc(0,0,mid,Math.PI*0.2,Math.PI*0.85); gfx.stroke({ color:0x000000,width:bw,alpha:0.35,cap:'butt' })
        gfx.arc(0,0,mid,0,Math.PI*2);              gfx.stroke({ color:cfg.color,width:bw-1,alpha:1,cap:'butt' })
        gfx.arc(0,0,RING_INNER+1.5,0,Math.PI*2);  gfx.stroke({ color:cfg.shine,width:2,alpha:0.3,cap:'butt' })
        gfx.arc(0,0,mid,-Math.PI*0.95,-Math.PI*0.25); gfx.stroke({ color:cfg.shine,width:bw*0.55,alpha:0.75,cap:'round' })
        gfx.arc(0,0,mid,-Math.PI*0.75,-Math.PI*0.55); gfx.stroke({ color:WHITE,width:bw*0.3,alpha:0.55,cap:'round' })
        gfx.arc(0,0,mid, Math.PI*0.6, Math.PI*0.82);  gfx.stroke({ color:cfg.shine,width:bw*0.25,alpha:0.3,cap:'round' })
        g.addChild(gfx)
        if (cfg.label) { const lbl=makeText(cfg.label,{fontSize:8,fill:cfg.shine}); lbl.anchor.set(0.5); g.addChild(lbl) }
        g.filters=[new GlowFilter({ distance:14, outerStrength:subtype==='diamond'?2.5:1.5, color:cfg.glowColor })]
        g.x=RING_OUTER+12+Math.random()*(W-(RING_OUTER+12)*2); g.y=-(RING_OUTER+10)
        return { type:'ring', subtype, gfx:g, wobble:Math.random()*Math.PI*2, wobbleAmp:(Math.random()-0.5)*1.2, spin:0 }
      }

      function makeFlower(xOverride) {
        const g=new Container(); const gfx=new Graphics(); const r=FLOWER_R
        for (let i=0;i<5;i++) {
          const a=(i/5)*Math.PI*2
          gfx.ellipse(Math.cos(a)*r*0.65,Math.sin(a)*r*0.65,r*0.45,r*0.55); gfx.fill({ color:FLOWER_PINK,alpha:0.92 })
        }
        gfx.circle(0,0,r*0.35); gfx.fill({ color:FLOWER_LIGHT })
        gfx.circle(0,0,r*0.18); gfx.fill({ color:GOLD_LIGHT })
        g.addChild(gfx)
        const lbl=makeText('✿',{fontSize:Math.round(r*0.9),fill:WHITE}); lbl.anchor.set(0.5); lbl.alpha=0.85; g.addChild(lbl)
        g.filters=[new GlowFilter({ distance:18, outerStrength:2.5, color:FLOWER_PINK })]
        g.x=xOverride??(r+12+Math.random()*(W-(r+12)*2)); g.y=-(r+10)
        return { type:'flower', subtype:'flower', gfx:g, wobble:Math.random()*Math.PI*2, wobbleAmp:0, spin:(Math.random()-0.5)*0.04 }
      }

      function makePowerup(subtype) {
        const cfg=POWERUP_TYPES[subtype]; const g=new Container(); const gfx=new Graphics(); const r=PU_R
        // Diamond shape — distinct from rings (circles) and flowers (petals)
        gfx.poly([0,-r, r*0.7,0, 0,r, -r*0.7,0]); gfx.fill({ color:cfg.color, alpha:0.2 })
        gfx.poly([0,-r, r*0.7,0, 0,r, -r*0.7,0]); gfx.stroke({ color:cfg.color, width:2.5, alpha:0.88 })
        gfx.poly([0,-r*0.6, r*0.4,0, 0,r*0.6, -r*0.4,0]); gfx.stroke({ color:WHITE, width:1, alpha:0.18 })
        g.addChild(gfx)
        const lbl=makeText(cfg.emoji,{fontSize:Math.round(r*0.9),fill:cfg.color}); lbl.anchor.set(0.5); g.addChild(lbl)
        g.filters=[new GlowFilter({ distance:16, outerStrength:2.2, color:cfg.color })]
        g.x=r+16+Math.random()*(W-(r+16)*2); g.y=-(r+10)
        return { type:'powerup', subtype, gfx:g, wobble:Math.random()*Math.PI*2, wobbleAmp:(Math.random()-0.5)*0.7, spin:(Math.random()-0.5)*0.022 }
      }

      // ── active effects (performance.now timestamps — FPS-independent) ──────
      // activateEffect always sets endsAt = now + duration — refresh, not stack.
      // Double score can never stack infinitely: catching it again just resets timer.
      const activeEffects = {
        magnet: { active:false, endsAt:0, duration:POWERUP_TYPES.magnet.duration },
        slow:   { active:false, endsAt:0, duration:POWERUP_TYPES.slow.duration   },
        double: { active:false, endsAt:0, duration:POWERUP_TYPES.double.duration  },
      }

      function activateEffect(key) {
        activeEffects[key].active = true
        activeEffects[key].endsAt = performance.now() + activeEffects[key].duration
      }

      function applyPowerup(subtype) {
        sfxPowerup()
        const cfg = POWERUP_TYPES[subtype]
        if (subtype === 'heart') {
          if (lives < LIVES_MAX) {
            lives++; updateHUD()
            floatText('❤️ +1', pillowContainer.x, pillowContainer.y-50, cfg.color)
          } else {
            score += 500; updateHUD()   // max lives — bonus points instead
            floatText('❤️ +500', pillowContainer.x, pillowContainer.y-50, cfg.color)
          }
        } else {
          activateEffect(subtype)
          floatText(cfg.emoji+' '+subtype.toUpperCase()+'!', W/2, H/2-65, cfg.color)
        }
        flashPillow(cfg.color)
        squishPillow()
      }

      // ── game state ────────────────────────────────────────────────────────
      let score             = 0
      let lives             = LIVES_MAX
      let entities          = []           // unified: rings + flowers + powerups
      let spawnTimer        = 0
      let spawnInterval     = SPAWN_START
      let fallSpeed         = SPEED_START
      let gameOver          = false
      let combo             = 0
      let comboFadeTimer    = 0
      let lastFlowerBurstAt = 0
      let ringPauseTimer    = 0
      let lastPowerupAt     = -POWERUP_COOLDOWN  // allow spawn at game start

      function updateHUD() {
        scoreLbl.text = String(score); drawHearts()
        if (combo >= 2) { comboLbl.text=`×${combo} combo`; comboLbl.alpha=1; comboFadeTimer=90 }
      }
      updateHUD()

      // ── flower burst ──────────────────────────────────────────────────────
      function spawnFlowerBurst(count) {
        if (count < 2) return
        entities = entities.filter(e => {
          if (e.type==='ring') { app.stage.removeChild(e.gfx); e.gfx.destroy(); return false }
          return true
        })
        ringPauseTimer = 4000
        for (let i=0;i<count;i++) {
          const x=(FLOWER_R+12)+(i/(count-1))*(W-(FLOWER_R+12)*2)
          const e=makeFlower(x); e.gfx.y=-(FLOWER_R+10+i*18)
          app.stage.addChildAt(e.gfx,3); entities.push(e)
        }
      }

      // ── main loop ─────────────────────────────────────────────────────────
      app.ticker.add(ticker => {
        const dt  = ticker.deltaTime
        const now = performance.now()

        // 1. Particles — single loop replaces hundreds of individual tickers
        for (let i=particles.length-1;i>=0;i--) {
          const p=particles[i]
          if (p.type==='sparkle') {
            p.gfx.x += p.vx*dt*0.8; p.gfx.y += (p.vy+(1-p.life)*5)*dt*0.8
            p.life  -= 0.035*dt; p.gfx.rotation += 0.1*dt
          } else {
            p.gfx.y += p.vy*dt; p.life -= 0.055*dt
          }
          p.gfx.alpha = Math.max(0,p.life)
          if (p.life<=0) { app.stage.removeChild(p.gfx); p.gfx.destroy(); particles.splice(i,1) }
        }

        // 2. Twinkle stars
        for (const s of twinkleStars) { s._phase+=s._speed*dt; s.alpha=0.2+Math.abs(Math.sin(s._phase))*0.6 }

        // 3. Expire effects + update HUD bars (scale.x only — no redraw)
        for (const key of HUD_KEYS) {
          const eff=activeEffects[key]
          if (eff.active && now>eff.endsAt) eff.active=false
          const hud=effectHUD[key]
          if (eff.active) {
            hud.cont.alpha = 1
            hud.fill.scale.x = Math.max(0,(eff.endsAt-now)/eff.duration)
          } else {
            hud.cont.alpha = 0
          }
        }

        // 4. Combo fade
        if (comboFadeTimer>0) { comboFadeTimer-=dt; if (comboFadeTimer<=0) comboLbl.alpha=0 }

        if (gameOver) return

        // 5. Keyboard pillow
        if (keys['ArrowLeft']||keys['a'])  pillowContainer.x=Math.max(PILLOW_W/2,pillowContainer.x-PILLOW_SPEED*dt)
        if (keys['ArrowRight']||keys['d']) pillowContainer.x=Math.min(W-PILLOW_W/2,pillowContainer.x+PILLOW_SPEED*dt)

        // 6. Spawn — power-up cooldown prevents spam
        if (ringPauseTimer>0) {
          ringPauseTimer -= ticker.deltaMS
        } else {
          spawnTimer += ticker.deltaMS
          if (spawnTimer>=spawnInterval) {
            spawnTimer=0
            const canPU  = (now-lastPowerupAt)>POWERUP_COOLDOWN
            const pick   = pickEntityType(canPU)
            let entity
            if      (pick.type==='ring')   entity=makeRing(pick.subtype)
            else if (pick.type==='flower') entity=makeFlower()
            else { entity=makePowerup(pick.subtype); lastPowerupAt=now }
            app.stage.addChildAt(entity.gfx,3); entities.push(entity)
            if (spawnInterval>SPAWN_MIN) spawnInterval=Math.max(SPAWN_MIN,spawnInterval-10)
            fallSpeed=Math.min(SPEED_MAX,fallSpeed+0.04)
          }
        }

        // 7. Flower burst milestones
        const milestone=Math.floor(combo/COMBO_FLOWER_BURST)*COMBO_FLOWER_BURST
        if (combo>=COMBO_FLOWER_BURST && milestone>lastFlowerBurstAt) {
          lastFlowerBurstAt=milestone; spawnFlowerBurst(FLOWER_BURST_COUNT)
          floatText(`🌸 ×${milestone} COMBO! 🌸`, W/2, H/2-40, FLOWER_PINK)
        }
        if (combo===0) lastFlowerBurstAt=0

        // 8. Effective fall speed — slow time affects fall only, NOT spawn rate
        const effSpeed = activeEffects.slow.active ? fallSpeed*0.38 : fallSpeed

        // 9. Update all entities
        entities = entities.filter(entity => {
          const { type, subtype, gfx } = entity

          // ── FLOWER ──────────────────────────────────────────────────────
          if (type==='flower') {
            gfx.y       += effSpeed*0.7*dt; entity.wobble+=0.02*dt
            gfx.rotation += entity.spin*dt; gfx.x+=Math.sin(entity.wobble*1.5)*0.8*dt
            if (Math.random()<0.25 && particles.length<MAX_PARTICLES) spawnTrail(gfx.x,gfx.y,FLOWER_PINK)
            const glow=gfx.filters?.[0]; if (glow?.outerStrength!=null) glow.outerStrength=2+Math.sin(entity.wobble*4)*0.8
            const inX=Math.abs(gfx.x-pillowContainer.x)<PILLOW_W/2+FLOWER_R*0.7
            const inY=gfx.y>=pillowContainer.y-PILLOW_H/2-FLOWER_R*0.7 && gfx.y<=pillowContainer.y+PILLOW_H/2
            if (inX&&inY) {
              score+=FLOWER_POINTS; updateHUD(); sfxFlower()
              spawnSparkles(gfx.x,pillowContainer.y,FLOWER_PINK)
              floatText(`+${FLOWER_POINTS} 🌸`,gfx.x,pillowContainer.y-40,FLOWER_PINK)
              squishPillow(); app.stage.removeChild(gfx); gfx.destroy(); return false
            }
            if (gfx.y>H+FLOWER_R+10) { app.stage.removeChild(gfx); gfx.destroy(); return false }
            return true
          }

          // ── POWER-UP ────────────────────────────────────────────────────
          if (type==='powerup') {
            const cfg=POWERUP_TYPES[subtype]
            gfx.y       += effSpeed*0.55*dt   // falls slower — easier to spot
            entity.wobble += 0.018*dt; gfx.rotation+=entity.spin*dt
            gfx.x       += Math.sin(entity.wobble)*entity.wobbleAmp*dt
            const glow=gfx.filters?.[0]; if (glow?.outerStrength!=null) glow.outerStrength=2+Math.sin(entity.wobble*3)*0.6
            const inX=Math.abs(gfx.x-pillowContainer.x)<PILLOW_W/2+PU_R*0.85
            const inY=gfx.y>=pillowContainer.y-PILLOW_H/2-PU_R*0.85 && gfx.y<=pillowContainer.y+PILLOW_H/2
            if (inX&&inY) {
              spawnSparkles(gfx.x,pillowContainer.y,cfg.color)
              applyPowerup(subtype); app.stage.removeChild(gfx); gfx.destroy(); return false
            }
            // Missed power-up — no life loss
            if (gfx.y>H+PU_R+10) { app.stage.removeChild(gfx); gfx.destroy(); return false }
            return true
          }

          // ── RING ────────────────────────────────────────────────────────
          const ringCfg=RING_TYPES[subtype]
          const spd=subtype==='diamond' ? effSpeed*0.8 : effSpeed
          gfx.y       += spd*dt; entity.wobble+=0.025*dt
          gfx.x       += Math.sin(entity.wobble)*entity.wobbleAmp*dt

          // Magnet: quadratic falloff — gentle at edge, strong near pillow, no jitter
          if (activeEffects.magnet.active) {
            const dx=pillowContainer.x-gfx.x; const dy=pillowContainer.y-gfx.y
            const dist=Math.sqrt(dx*dx+dy*dy)
            if (dist<MAGNET_RADIUS && dist>1) {
              const t=1-dist/MAGNET_RADIUS        // 0 at edge, 1 at center
              const f=MAGNET_FORCE*t*t            // quadratic: smooth, no teleport
              gfx.x+=(dx/dist)*f*dt; gfx.y+=(dy/dist)*f*dt
            }
          }

          if (Math.random()<0.25 && particles.length<MAX_PARTICLES) spawnTrail(gfx.x,gfx.y,ringCfg.glowColor)
          const glow=gfx.filters?.[0]; if (glow?.outerStrength!=null) glow.outerStrength=1.2+Math.sin(entity.wobble*3)*0.6

          const inX=Math.abs(gfx.x-pillowContainer.x)<PILLOW_W/2+RING_OUTER*0.55
          const inY=gfx.y>=pillowContainer.y-PILLOW_H/2-RING_OUTER*0.55 && gfx.y<=pillowContainer.y+PILLOW_H/2

          if (inX&&inY) {
            combo++
            // double score: 2× multiplier, no stacking (activateEffect resets timer each catch)
            const pts=ringCfg.points*combo*(activeEffects.double.active?2:1)
            score+=pts; updateHUD(); sfxCatch()
            spawnSparkles(gfx.x,pillowContainer.y,ringCfg.glowColor)
            const tag=(activeEffects.double.active?'×2 ':'')+(combo>1?`×${combo}`:'')
            floatText(`+${pts}${tag?' '+tag:''}`, gfx.x, pillowContainer.y-30, ringCfg.glowColor)
            squishPillow(); app.stage.removeChild(gfx); gfx.destroy(); return false
          }

          if (gfx.y>H+RING_OUTER+10) {
            combo=0; lives--; updateHUD(); sfxMiss(); flashPillow()
            app.stage.removeChild(gfx); gfx.destroy()
            if (lives<=0) { gameOver=true; onGameOverRef.current?.(score) }
            return false
          }
          return true
        })
      })

      // ── touch controls ────────────────────────────────────────────────────
      let lastTouchX=null
      const onTouchStart=e=>{ lastTouchX=e.touches[0].clientX }
      const onTouchMove=e=>{
        if (lastTouchX===null) return
        const dx=e.touches[0].clientX-lastTouchX
        pillowContainer.x=Math.max(PILLOW_W/2,Math.min(W-PILLOW_W/2,pillowContainer.x+dx))
        lastTouchX=e.touches[0].clientX
      }
      const onTouchEnd=()=>{ lastTouchX=null }
      app.canvas.addEventListener('touchstart', onTouchStart, { passive:true })
      app.canvas.addEventListener('touchmove',  onTouchMove,  { passive:true })
      app.canvas.addEventListener('touchend',   onTouchEnd,   { passive:true })
      app.canvas.addEventListener('touchcancel',onTouchEnd,   { passive:true })

      app._cleanupExtras = () => {
        window.removeEventListener('resize', onResize)
        container.removeEventListener('touchstart', unlockAudio)
        app.canvas.removeEventListener('touchstart', onTouchStart)
        app.canvas.removeEventListener('touchmove',  onTouchMove)
        app.canvas.removeEventListener('touchend',   onTouchEnd)
        app.canvas.removeEventListener('touchcancel',onTouchEnd)
        for (const p of particles) { p.gfx.destroy() }
        particles.length = 0
      }
    })()

    return () => {
      destroyed = true
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      if (app) { app._cleanupExtras?.(); app.destroy(true, { children: true }) }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" style={{ touchAction: 'none' }} />
}
