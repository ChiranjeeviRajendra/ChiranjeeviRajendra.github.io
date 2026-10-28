// Dependency-free migration checks against the production build in Chrome/Edge.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { gzipSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const legacy = resolve(root, '../angular-app/src')
const browserPath = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(path => path && existsSync(path))

assert.ok(browserPath, 'Chrome/Edge is required; set BROWSER_PATH to the executable.')
assert.ok(existsSync(join(dist, 'index.html')), 'Run npm run build first.')

const normalize = text => text.replace(/\s+/g, ' ').trim()
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"')
const original = section => readFileSync(join(legacy, `app/${section}/${section}.component.html`), 'utf8')

// Retain every original asset byte-for-byte, including those not currently used.
for (const name of readdirSync(join(legacy, 'assets'))) {
  assert.deepEqual(readFileSync(join(dist, 'assets', name)), readFileSync(join(legacy, 'assets', name)), name)
}
assert.deepEqual(readFileSync(join(dist, 'favicon.ico')), readFileSync(join(legacy, 'favicon.ico')))

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' }
const server = createServer((request, response) => {
  // Serve the same build at root and under a prefix to exercise relative assets.
  let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  pathname = pathname.replace(/^\/portfolio(?=\/)/, '')
  const file = resolve(dist, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`)
  if (!file.startsWith(`${dist}${sep}`) || !existsSync(file)) {
    response.writeHead(404).end()
    return
  }
  response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream')
  response.end(readFileSync(file))
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const profile = mkdtempSync(join(tmpdir(), 'portfolio-verify-'))
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'], windowsHide: true })

let sequence = 0
let buffer = ''
let sessionId
const pending = new Map()
const runtimeErrors = []
const failedRequests = []
const requestedUrls = []

function send(method, params = {}, session = sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
    pending.set(id, { resolve, reject, timeout })
    browser.stdio[3].write(`${JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) })}\0`)
  })
}

browser.stdio[4].setEncoding('utf8')
browser.stdio[4].on('data', chunk => {
  buffer += chunk.toString()
  let end
  while ((end = buffer.indexOf('\0')) !== -1) {
    const message = JSON.parse(buffer.slice(0, end))
    buffer = buffer.slice(end + 1)
    if (message.id) {
      const request = pending.get(message.id)
      if (!request) continue
      clearTimeout(request.timeout)
      pending.delete(message.id)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
    } else if (message.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(message.params.exceptionDetails.text)
    } else if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
      failedRequests.push(message.params.response.url)
    } else if (message.method === 'Network.requestWillBeSent') {
      requestedUrls.push(message.params.request.url)
    }
  }
})

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails))
  return result.result.value
}

async function waitFor(expression, label = expression) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(expression)) return
    await delay(50)
  }
  throw new Error(`Timed out: ${label}`)
}

async function navigate(path, section, prefix = '') {
  await send('Page.navigate', { url: `${origin}${prefix}/#/${path}` })
  await waitFor(`document.querySelector(${JSON.stringify(section)}) !== null`, path)
}

async function click(selector) {
  const point = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Missing click target: ' + ${JSON.stringify(selector)});
    element.scrollIntoView({ block: 'center' });
    const rect = element.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
}

async function key(key, code = key) {
  const keyCodes = { Enter: 13, ' ': 32, Escape: 27, ArrowLeft: 37, ArrowRight: 39 }
  const keyboard = { key, code, windowsVirtualKeyCode: keyCodes[key], nativeVirtualKeyCode: keyCodes[key] }
  await send('Input.dispatchKeyEvent', { type: 'keyDown', ...keyboard, text: key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...keyboard })
}

async function assertLayout() {
  assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Page overflows horizontally')
  assert.ok(await evaluate(`Array.from(document.images).filter(image => image.getBoundingClientRect().height && image.complete).every(image => image.naturalWidth > 0)`), 'Broken visible image')
}

async function openSummary(title, scope = 'main') {
  await evaluate(`(() => {
    const summary = Array.from(document.querySelectorAll(${JSON.stringify(`${scope} summary`)})).find(item => item.textContent.trim() === ${JSON.stringify(title)});
    if (!summary) throw new Error('Missing summary: ' + ${JSON.stringify(title)});
    summary.click();
  })()`)
  await delay(60)
}

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, null)
  ;({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }, null))
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await navigate('home', '.welcome')
  assert.equal(await evaluate('document.title'), 'Portfolio')
  assert.equal(await evaluate('document.querySelector("h1").textContent'), 'Welcome To My Portfolio')
  assert.ok(!requestedUrls.some(url => /\/(Skills|AboutMe|Contact|Education)-.*\.js/.test(url)), 'Home sections should load on demand')

  // Every carousel image and caption survives migration, including wraparound.
  const captions = [...original('home').matchAll(/<p class="p">(.*?)<\/p>/g)].map(match => normalize(decode(match[1])))
  for (const caption of captions) {
    assert.equal(await evaluate('document.querySelector(".caption").textContent'), caption)
    await waitFor('document.querySelector(".carousel img").complete && document.querySelector(".carousel img").naturalWidth > 0')
    await click('[aria-label="Next"]')
  }
  assert.equal(await evaluate('document.querySelector(".caption").textContent'), captions[0])
  await click('[aria-label="Previous"]')
  assert.equal(await evaluate('document.querySelector(".caption").textContent'), captions.at(-1))

  // Formal fields, informal content, and tab keyboard behavior.
  await openSummary('My Personal Details')
  await waitFor('document.querySelector("[role=tab]") !== null')
  const formalText = normalize(original('about-me').split('<mat-tab label="Informal Info">')[0].replace(/<[^>]*>/g, ' '))
  assert.equal(normalize(await evaluate('document.querySelector(".formal-info").innerText')), formalText)
  await evaluate('document.querySelector("[role=tab]").focus()')
  await key('ArrowRight')
  assert.ok((await evaluate('document.querySelector(".informal-info").innerText')).includes('Playing video games'))
  assert.equal(await evaluate('document.activeElement.textContent'), 'Informal Info')
  assert.equal(await evaluate('document.querySelectorAll(".informal-info li").length'), 8)

  await openSummary('My Skills')
  await waitFor('document.querySelector("section[aria-label=Skills]") !== null')
  assert.equal(await evaluate('document.querySelectorAll(".home-sections > details[open]").length'), 1)
  await openSummary('Frontend development')
  await openSummary('Angular')
  await waitFor('document.querySelector("section[aria-label=Skills] li") !== null')
  await openSummary('Frontend development')
  await openSummary('Frontend development')
  assert.ok(await evaluate('Array.from(document.querySelectorAll("summary")).find(item => item.textContent === "Angular").parentElement.open'), 'Nested expansion state should survive parent collapse')

  const routeSelectors = {
    personalDetails: '[role=tablist]', skills: 'section[aria-label=Skills]',
    experience: 'section[aria-label=Experience]', projects: 'section[aria-label=Projects]',
    education: 'section[aria-label=Education]', contact: 'section[aria-label=Contact]', home: '.welcome',
  }

  for (const width of [320, 390, 768, 1280]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 })
    for (const [route, selector] of Object.entries(routeSelectors)) {
      if (width < 700) await click('.menu-toggle')
      await click(`nav a[href="#/${route}"]`)
      await waitFor(`location.hash === '#/${route}' && document.querySelector(${JSON.stringify(selector)}) !== null`)
      if (width < 700) assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'false')
      await assertLayout()
    }
    console.log(`PASS: all seven routes, navigation and layout at ${width}px`)
  }

  await navigate('skills', 'section[aria-label=Skills]')
  // Expand every nested skill and compare all labels and descriptions verbatim.
  await evaluate('document.querySelectorAll("main details").forEach(item => { item.open = true })')
  await delay(80)
  await evaluate('document.querySelectorAll("main details").forEach(item => { item.open = true })')
  await delay(80)
  const skillsText = normalize(await evaluate('document.querySelector("main").innerText'))
  const expectedSkills = normalize(decode(original('skills').replace(/<[^>]*>/g, ' ')))
  assert.equal(skillsText, expectedSkills)
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: true })
  await assertLayout()
  await evaluate('document.querySelector("main summary").focus()')
  await key(' ', 'Space')
  assert.equal(await evaluate('document.querySelector("main details").open'), false)
  await key('Enter')
  assert.equal(await evaluate('document.querySelector("main details").open'), true)

  for (const section of ['education', 'experience', 'projects', 'contact']) {
    await navigate(section, `section[aria-label="${section[0].toUpperCase() + section.slice(1)}"]`)
    const expected = normalize(decode(original(section).replace(/<[^>]*>/g, ' ')))
    assert.equal(normalize(await evaluate('document.querySelector("main").innerText')), expected)
  }
  const links = await evaluate('Array.from(document.querySelectorAll(".contact-list a"), link => link.getAttribute("href"))')
  assert.deepEqual(links, ['tel:+917899782057', 'https://github.com/ChiranjeeviRajendra', 'https://api.whatsapp.com/send?phone=+917899782057', 'mailto:crjirja@gmail.com'])

  await navigate('personalDetails', '[role=tablist]')
  await send('Page.reload')
  await waitFor('document.querySelector("[role=tablist]") !== null')
  await navigate('missing-page', '.welcome')
  assert.equal(await evaluate('location.hash'), '#/')
  await navigate('education', 'section[aria-label=Education]', '/portfolio')
  await navigate('home', '.welcome', '/portfolio')
  await waitFor('document.querySelector(".carousel img").complete && document.querySelector(".carousel img").naturalWidth > 0')
  await assertLayout()

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await click('.menu-toggle')
  await waitFor('document.activeElement.closest("nav") !== null')
  assert.ok(await evaluate('document.querySelector("main").inert'))
  await key('Escape')
  await waitFor('document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "false"')
  assert.equal(await evaluate('document.activeElement.className'), 'menu-toggle')

  // Check autoplay and pause while keeping reduced-motion preference respected.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await evaluate('document.activeElement.blur()')
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
  const before = await evaluate('document.querySelector(".caption").textContent')
  await waitFor(`document.querySelector('.caption').textContent !== ${JSON.stringify(before)}`, 'carousel autoplay')
  await click('[aria-label="Pause slideshow"]')
  const pausedCaption = await evaluate('document.querySelector(".caption").textContent')
  await evaluate('document.activeElement.blur()')
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
  await delay(3400)
  assert.equal(await evaluate('document.querySelector(".caption").textContent'), pausedCaption)

  if (process.env.SCREENSHOT_DIR) {
    const { data } = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.env.SCREENSHOT_DIR, 'portfolio-mobile.png'), Buffer.from(data, 'base64'))
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
    const desktop = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(join(process.env.SCREENSHOT_DIR, 'portfolio-desktop.png'), Buffer.from(desktop.data, 'base64'))
  }

  assert.deepEqual(runtimeErrors, [], 'Browser runtime errors')
  assert.deepEqual(failedRequests, [], 'Failed asset requests')
  assert.ok(requestedUrls.every(url => url.startsWith(origin)), 'Unexpected external request')
  const code = readdirSync(join(dist, 'assets')).filter(name => /\.(js|css)$/.test(name))
  const bytes = code.reduce((sum, name) => sum + readFileSync(join(dist, 'assets', name)).length, 0)
  const gzip = code.reduce((sum, name) => sum + gzipSync(readFileSync(join(dist, 'assets', name))).length, 0)
  console.log('PASS: content and asset parity, hash reloads, fallback, subdirectory hosting, keyboard controls, nested state, carousel and no external requests')
  console.log(`Production JS + CSS (all routes): ${(bytes / 1000).toFixed(2)} kB; ${(gzip / 1000).toFixed(2)} kB gzip`)
} finally {
  for (const request of pending.values()) clearTimeout(request.timeout)
  browser.kill()
  await new Promise(resolve => server.close(resolve))
  // Only delete the unique temporary browser profile created by this script.
  await delay(400)
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
