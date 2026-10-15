// Relay marketing page: gentle reveals, the handoff demo, copy button, OS note.
// Everything works without this script; it only adds motion and conveniences.
document.documentElement.classList.add('js')

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Nav border once the page scrolls.
const nav = document.querySelector('.nav')
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// Reveal sections once as they come into view.
const reveals = document.querySelectorAll('.reveal')
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('in'))
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const siblings = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'))
        e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 6) * 70}ms`
        e.target.classList.add('in')
        io.unobserve(e.target)
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )
  reveals.forEach((el) => io.observe(el))
}

// The demo plays once when it scrolls into view; "Play again" restarts it.
const demo = document.querySelector('[data-demo]')
const play = () => {
  demo.classList.remove('play')
  void demo.offsetWidth // restart the CSS animations
  demo.classList.add('play')
}
if (demo) {
  if (reduced || !('IntersectionObserver' in window)) {
    demo.classList.add('play')
  } else {
    const once = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play()
          once.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    once.observe(demo)
  }
  document.querySelector('[data-replay]')?.addEventListener('click', play)
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
const windows = /Windows/i.test(ua) && !/Windows Phone/i.test(ua)
if (!windows) document.querySelectorAll('.os-note').forEach((n) => (n.hidden = false))
