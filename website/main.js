// Relay marketing page: the live handoff scene, gentle reveals, copy button and
// the Windows-only note. The page works without this script; it adds motion.
document.documentElement.classList.add('js')

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Nav gets a background once the page scrolls.
const nav = document.querySelector('.nav')
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// Reveal blocks once as they come into view.
const reveals = document.querySelectorAll('.reveal')
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('in'))
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const group = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'))
        e.target.style.transitionDelay = `${Math.min(group.indexOf(e.target), 5) * 80}ms`
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  reveals.forEach((el) => io.observe(el))
}

// ---------------------------------------------------------------------------
// The live handoff, on a Windows desktop: Claude Code stops at its limit → the
// Relay button turns red → Relay opens → Continue → Antigravity → Done →
// paste the starting message → Antigravity carries on. Loops while on screen;
// pauses off screen, in a background tab, or with the Pause button.
const scene = document.querySelector('[data-scene]')
if (scene) {
  const $ = (s) => scene.querySelector(s)
  const $$ = (s) => [...scene.querySelectorAll(s)]
  const inner = $('.scene-in')
  const typed = $('[data-type]')
  const caret = $('.caret')
  const termLines = $$('.app-term .ln')
  const spin = $('.app-term .spin')
  const stopLine = $('.app-term .stop')
  const composer = $('.composer')
  const you = $('.msg.you')
  const think = $('.msg.think')
  const ai = $('.msg.ai')
  const stream = $('[data-stream]')
  const tools = $$('.msg.tool')
  const added = $$('.src .add')
  const panel = $('.panel')
  const shots = $$('.shot')
  const edge = $('.edge')
  const cursor = $('.cursor')
  const ripple = $('.ripple')
  const keys = $('.keys')
  const keysHtml = keys.innerHTML
  const beats = $$('[data-beat]')
  const playBtn = $('[data-play]')

  let run = 0 // bumped to cancel the running timeline
  let running = 0 // id of the timeline that is playing, 0 when none
  let paused = false
  let inView = false

  const wait = (ms, id) => new Promise((ok, stop) => setTimeout(() => (id === run ? ok() : stop(new Error('stopped'))), ms))
  const beat = (n) => beats.forEach((b) => b.classList.toggle('on', Number(b.dataset.beat) === n))
  const showShot = (name) => shots.forEach((s) => s.classList.toggle('on', s.dataset.shot === name))
  const at = (el, fx, fy) => {
    const r = el.getBoundingClientRect()
    const b = inner.getBoundingClientRect()
    return [r.left - b.left + r.width * fx, r.top - b.top + r.height * fy]
  }
  let point = [0, 0]
  const moveTo = (p, instant = false) => {
    point = p
    if (instant) cursor.style.transition = 'none'
    cursor.style.setProperty('--cx', `${p[0] - 5}px`)
    cursor.style.setProperty('--cy', `${p[1] - 3}px`)
    if (instant) {
      void cursor.offsetWidth
      cursor.style.transition = ''
    }
  }
  const click = () => {
    cursor.classList.remove('press')
    ripple.classList.remove('go')
    ripple.style.left = `${point[0]}px`
    ripple.style.top = `${point[1]}px`
    void cursor.offsetWidth
    cursor.classList.add('press')
    ripple.classList.add('go')
  }
  const showKeys = (html) => {
    keys.innerHTML = html
    keys.classList.add('show')
  }

  const reset = () => {
    scene.classList.remove('ag-open')
    typed.textContent = ''
    caret.classList.remove('on')
    termLines.forEach((l) => l.classList.remove('show', 'gone'))
    ;[you, think, ai, ...tools].forEach((m) => m.classList.remove('show', 'gone'))
    stream.textContent = ''
    composer.classList.remove('focus', 'filled')
    added.forEach((l) => l.classList.remove('show', 'settled'))
    panel.classList.remove('open')
    showShot('home')
    edge.classList.remove('stopped', 'open', 'hover')
    cursor.classList.remove('on', 'press')
    keys.classList.remove('show')
    keys.innerHTML = keysHtml
    beat(0)
    const b = inner.getBoundingClientRect()
    moveTo([b.width * 0.5, b.height * 0.66], true)
  }

  // The story's last frame, shown as a still when motion is reduced.
  const finalState = () => {
    reset()
    typed.textContent = typed.dataset.type
    termLines.forEach((l) => l.classList.add('show'))
    spin.classList.add('gone')
    scene.classList.add('ag-open')
    stream.textContent = stream.dataset.stream
    ;[you, ai, ...tools].forEach((m) => m.classList.add('show'))
    think.classList.add('gone')
    added.forEach((l) => l.classList.add('show', 'settled'))
    beat(3)
  }

  async function playOnce(id) {
    reset()
    await wait(700, id)

    // 1 · Claude Code works, then stops at its limit.
    beat(1)
    caret.classList.add('on')
    for (const ch of typed.dataset.type) {
      typed.textContent += ch
      await wait(ch === ' ' ? 55 : 34, id)
    }
    await wait(450, id)
    caret.classList.remove('on')
    for (const line of termLines) {
      if (line === stopLine) break
      line.classList.add('show')
      await wait(line === spin ? 1500 : 520, id)
    }
    spin.classList.add('gone')
    stopLine.classList.add('show')
    edge.classList.add('stopped')
    await wait(1200, id)

    // 2 · Relay: open it from the button, Continue, pick Antigravity, Done.
    cursor.classList.add('on')
    moveTo(at(edge, 0.5, 0.5))
    await wait(1000, id)
    edge.classList.add('hover')
    await wait(220, id)
    click()
    edge.classList.add('open')
    panel.classList.add('open')
    beat(2)
    await wait(1400, id)

    moveTo(at(panel, 0.43, 0.94)) // "Continue in another AI"
    await wait(1050, id)
    click()
    await wait(200, id)
    showShot('pick')
    await wait(1000, id)

    moveTo(at(panel, 0.23, 0.345)) // Antigravity
    await wait(1050, id)
    click()
    await wait(200, id)
    showShot('done')
    await wait(600, id)
    scene.classList.add('ag-open') // Relay opened Antigravity on the project
    await wait(1700, id)

    moveTo(at(panel, 0.625, 0.954)) // Done
    await wait(1000, id)
    click()
    await wait(160, id)
    panel.classList.remove('open')
    edge.classList.remove('open', 'hover', 'stopped')
    beat(3)
    await wait(700, id)

    // 3 · Paste the starting message into Antigravity and send it.
    moveTo(at(composer, 0.45, 0.5))
    await wait(1050, id)
    click()
    composer.classList.add('focus')
    await wait(450, id)
    showKeys('<kbd>Ctrl</kbd><span>+</span><kbd>V</kbd>')
    await wait(450, id)
    composer.classList.add('filled')
    await wait(800, id)
    keys.classList.remove('show')
    await wait(350, id)
    showKeys('<kbd>Enter</kbd>')
    await wait(400, id)
    composer.classList.remove('filled')
    you.classList.add('show')
    await wait(350, id)
    keys.classList.remove('show')
    cursor.classList.remove('on')

    // The agent reads the handoff and carries on.
    await wait(400, id)
    think.classList.add('show')
    await wait(1400, id)
    think.classList.add('gone')
    ai.classList.add('show')
    for (const word of stream.dataset.stream.split(' ')) {
      stream.textContent += (stream.textContent ? ' ' : '') + word
      await wait(70, id)
    }
    await wait(400, id)
    for (const line of added) {
      line.classList.add('show')
      await wait(380, id)
    }
    tools[0].classList.add('show')
    await wait(900, id)
    added.forEach((l) => l.classList.add('settled'))
    tools[1].classList.add('show')
    composer.classList.remove('focus')
    await wait(5200, id)
  }

  async function start() {
    if (running || paused || !inView || document.hidden) return
    const id = ++run
    running = id
    try {
      while (id === run) await playOnce(id)
    } catch {
      /* stopped */
    }
    if (running === id) running = 0
  }
  const stop = () => {
    run++
    running = 0
  }

  if (reduced) {
    finalState()
    playBtn.hidden = true
  } else {
    reset()
    new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting)
        if (inView) start()
        else stop()
      },
      { threshold: 0.2 },
    ).observe(scene)
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
    playBtn.addEventListener('click', () => {
      paused = !paused
      playBtn.textContent = paused ? 'Play' : 'Pause'
      playBtn.setAttribute('aria-pressed', String(paused))
      if (paused) stop()
      else start()
    })
  }
}

// Copy the sample handoff.
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = document.querySelector(btn.dataset.copy)?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(text)
      btn.textContent = 'Copied'
    } catch {
      btn.textContent = 'Select and copy'
    }
    setTimeout(() => (btn.textContent = 'Copy'), 1800)
  })
})

// Relay is a Windows app: tell phone and Mac visitors before they download.
const ua = navigator.userAgent
if (!(/Windows/i.test(ua) && !/Windows Phone/i.test(ua))) document.querySelectorAll('.os-note').forEach((n) => (n.hidden = false))

// Downloads come straight from this site, so they start on the first click.
// Say so right away, with what to do next and a link in case the browser blocked it.
let dlTimer
document.querySelectorAll('[data-dl]').forEach((a) => {
  a.addEventListener('click', () => {
    let toast = document.querySelector('.dl-toast')
    if (!toast) {
      toast = document.createElement('div')
      toast.className = 'dl-toast'
      toast.setAttribute('role', 'status')
      toast.innerHTML = '<span class="dl-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></span><div><b></b><p></p></div><button class="dl-x" aria-label="Close">×</button>'
      toast.querySelector('.dl-x').addEventListener('click', () => toast.classList.remove('on'))
      document.body.appendChild(toast)
    }
    const file = a.dataset.dl
    toast.querySelector('b').textContent = `Downloading ${file}`
    toast.querySelector('p').innerHTML = `Open it when it finishes. If Windows says it protected your PC, click <i>More info</i>, then <i>Run anyway</i>. Didn’t start? <a href="${a.getAttribute('href')}" download>Try again</a>.`
    requestAnimationFrame(() => toast.classList.add('on'))
    clearTimeout(dlTimer)
    dlTimer = setTimeout(() => toast.classList.remove('on'), 12000)
  })
})
