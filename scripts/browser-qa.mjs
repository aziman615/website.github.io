import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Dependency-free browser checks against the actual local app.
const urlArgument = process.argv.indexOf('--url')
const origin = (urlArgument !== -1 && process.argv[urlArgument + 1]) || process.env.PREVIEW_URL || 'http://127.0.0.1:3000'
const artifacts = path.resolve('.preview')
await mkdir(artifacts, { recursive: true })
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-background-networking', '--disable-sync',
  '--remote-debugging-port=0', `--user-data-dir=${path.join(artifacts, 'chrome-profile')}`, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const errors = [], checks = []
let socket, nextId = 0
const pending = new Map()
function assert(value, description) {
  checks.push({ description, passed: !!value })
  if (!value) throw new Error(description)
}

try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => reject(new Error('Chrome startup timed out')), 15000)
    chrome.once('error', reject)
    chrome.stderr.on('data', chunk => {
      output += chunk.toString()
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (match) { clearTimeout(timeout); resolve(match[1]) }
    })
  })
  const port = new URL(endpoint).port
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timeout } = pending.get(message.id)
      clearTimeout(timeout); pending.delete(message.id)
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text)
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 20000)
    pending.set(id, { resolve, reject, timeout })
    socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result.value
  }
  const viewport = async (width, height, mobile = false) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
    await delay(200)
  }
  const ready = async () => {
    for (let i = 0; i < 80; i++) {
      if (await evaluate('Boolean(document.querySelector("h1"))')) break
      await delay(100)
    }
    await evaluate('Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]).then(() => true)')
    await delay(400)
  }
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`)
    await delay(250)
    const point = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2} })()`)
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point })
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point })
    await delay(100)
  }
  const key = async (key, code, virtual) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtual, ...(key === 'Enter' ? { text: '\r' } : {}) })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtual })
    await delay(100)
  }
  const screenshot = async (name, fullPage = false) => {
    const params = { format: 'png', captureBeyondViewport: fullPage }
    if (fullPage) {
      const { cssContentSize } = await send('Page.getLayoutMetrics')
      params.clip = { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 }
    }
    const { data } = await send('Page.captureScreenshot', params)
    await writeFile(path.join(artifacts, `${name}.png`), Buffer.from(data, 'base64'))
  }
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable')
  if (process.argv.includes('--reference')) {
    await viewport(1440, 1000)
    await send('Page.navigate', { url: 'https://abdullah-portfolio-dev.vercel.app/' })
    await ready()
    await delay(2500)
    await screenshot('reference-hero')
    const details = await evaluate(`JSON.stringify({
      title:document.title,
      text:document.body.innerText,
      headings:[...document.querySelectorAll('h1,h2,h3')].map(n=>({text:n.innerText,font:getComputedStyle(n).fontFamily,size:getComputedStyle(n).fontSize,color:getComputedStyle(n).color})),
      sections:[...document.querySelectorAll('section')].map(n=>({id:n.id,classes:n.className,background:getComputedStyle(n).backgroundColor})),
      images:[...document.images].map(n=>({src:n.src,alt:n.alt})),
      body:{background:getComputedStyle(document.body).backgroundColor,font:getComputedStyle(document.body).fontFamily},
    },null,2)`)
    await writeFile(path.join(artifacts,'reference-details.json'),details)
    const referenceHeight = await evaluate('document.documentElement.scrollHeight')
    for (let y=0;y<referenceHeight;y+=700) {
      await evaluate(`window.scrollTo({top:${y},behavior:'instant'})`)
      await delay(200)
    }
    await evaluate('window.scrollTo({top:0,behavior:"instant"})')
    await delay(800)
    await screenshot('reference-full',true)
    await viewport(390,844,true)
    await delay(600)
    await screenshot('reference-mobile')
    console.log(JSON.stringify({referenceHeight,artifacts}))
  } else {
  await viewport(1440, 1000)
  await send('Page.navigate', { url: origin })
  await ready()
  await evaluate('localStorage.removeItem("portfolio-theme")')
  await send('Page.reload')
  await ready()
  assert(await evaluate('document.querySelectorAll(".project-card").length === 5'), 'All five projects render')
  assert(await evaluate('getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)"'), 'Reference-inspired black background is applied')
  assert(await evaluate('getComputedStyle(document.querySelector("h1")).fontFamily.includes("Fugaz One")'), 'Reference display typography is applied')
  assert(await evaluate('document.querySelector("h1").textContent === "AZIMAN"'), 'Hero uses the portfolio owner’s name')
  assert(await evaluate('document.querySelectorAll(".hero-navigation a").length === 3'), 'Floating section navigation is present')
  assert(await evaluate('!document.querySelector(".github-ribbon") && !document.querySelector("a[href*=github]")'), 'Both GitHub elements from the screenshots are removed')
  assert(await evaluate('document.querySelectorAll(".hero-socials a").length === 2'), 'LinkedIn and email social buttons remain')
  await screenshot('desktop-hero')

  await click('.filters button:nth-child(3)')
  assert(await evaluate('document.querySelectorAll(".project-card").length === 1 && document.querySelector(".project-card").textContent.includes("Smart Pro Alert")'), 'Automation filter shows the matching project')
  await click('.filters button:nth-child(2)')
  assert(await evaluate('document.querySelectorAll(".project-card").length === 4'), 'Platforms filter shows four projects')
  await click('.filters button:first-child')
  assert(await evaluate('document.querySelectorAll(".project-card").length === 5'), 'All work restores five projects')

  for (let i = 1; i <= 5; i++) {
    await click(`.project-card:nth-child(${i}) .project-open`)
    assert(await evaluate('Boolean(document.querySelector("dialog[open]")) && document.querySelector("dialog").textContent.includes("The challenge")'), `Project ${i} details open`)
    await key('Tab', 'Tab', 9)
    assert(await evaluate('document.querySelector("dialog").contains(document.activeElement)'), `Project ${i} keeps keyboard focus inside the dialog`)
    await key('Escape', 'Escape', 27)
    assert(await evaluate('!document.querySelector("dialog") && document.activeElement.classList.contains("project-open")'), `Project ${i} closes with Escape and restores focus`)
  }
  await send('Browser.grantPermissions', { origin: new URL(origin).origin, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] })
  await click('.copy-button')
  assert(await evaluate('document.querySelector(".copy-button").textContent.includes("Copied")'), 'Copy email provides success feedback')
  assert(await evaluate('navigator.clipboard.readText()') === 'aziman605@gmail.com', 'Copy email writes the correct address')

  for (const width of [320, 390, 600, 768, 1024, 1440, 1920]) {
    await viewport(width, 900, width < 600)
    const overflow = await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
    assert(overflow.scroll <= overflow.width, `No horizontal overflow at ${width}px (${overflow.scroll}px)`)
  }

  await viewport(390, 844, true)
  await evaluate('window.scrollTo({top:0,behavior:"instant"})')
  for (const [selector, hash] of [['.float-about', '#about'], ['.float-tech', '#tech'], ['.float-work', '#work']]) {
    await click(selector)
    assert(await evaluate(`location.hash === ${JSON.stringify(hash)}`), `Mobile floating navigation follows ${hash}`)
    await delay(900)
    await evaluate('window.scrollTo({top:0,behavior:"instant"})')
  }
  await delay(900)
  await evaluate('window.scrollTo({top:0,behavior:"instant"})')
  await delay(700)
  await screenshot('mobile-hero')
  await click('.project-card .project-open')
  await screenshot('mobile-dialog')
  assert(await evaluate('document.querySelector("dialog").scrollWidth <= document.querySelector("dialog").clientWidth'), 'Mobile project dialog has no horizontal overflow')
  await click('dialog .icon-button')

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await delay(150)
  assert(await evaluate('parseFloat(getComputedStyle(document.querySelector(".float-link")).animationDuration) <= 0.00001'), 'Reduced motion disables the floating animation')
  assert(await evaluate('getComputedStyle(document.documentElement).scrollBehavior === "auto"'), 'Reduced motion disables smooth scrolling')

  await viewport(1440, 1000)
  const height = await evaluate('document.documentElement.scrollHeight')
  for (let y = 0; y < height; y += 650) {
    await evaluate(`window.scrollTo({top:${y},behavior:'instant'})`)
    await delay(110)
  }
  await evaluate('window.scrollTo({top:0,behavior:"instant"})')
  await delay(750)
  await screenshot('desktop-full', true)
  await evaluate('document.querySelector("#work").scrollIntoView({behavior:"instant"})')
  await screenshot('desktop-work')
  assert(await evaluate('[...document.images].every(image => image.complete && image.naturalWidth > 0)'), 'All local technology icons load successfully')

  await send('Page.bringToFront')
  await evaluate('document.querySelector(".theme-toggle").focus()')
  await key('Enter', 'Enter', 13)
  assert(await evaluate('document.documentElement.dataset.theme === "light"'), 'Theme toggle works with the keyboard')
  assert(await evaluate('localStorage.getItem("portfolio-theme") === "light"'), 'Light theme preference is saved')
  assert(await evaluate('document.querySelector("meta[name=theme-color]").content === "#f6f9fc"'), 'Browser theme colour follows the light theme')
  await send('Page.reload')
  await ready()
  assert(await evaluate('document.documentElement.dataset.theme === "light" && getComputedStyle(document.body).backgroundColor === "rgb(246, 249, 252)"'), 'Light theme survives reload and changes the page background')
  assert(await evaluate('document.querySelector(".theme-toggle").getAttribute("aria-pressed") === "true"'), 'Theme toggle exposes its active state')
  await evaluate('window.scrollTo({top:0,behavior:"instant"})')
  await screenshot('desktop-light')
  const lightTextContrast = await evaluate(`(() => {
    const luminance = colour => {
      const values = colour.match(/[\\d.]+/g).slice(0,3).map(Number).map(value => {
        const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      });
      return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
    };
    const background = luminance(getComputedStyle(document.body).backgroundColor);
    const text = luminance(getComputedStyle(document.querySelector('.contact-copy')).color);
    return (Math.max(background,text) + .05) / (Math.min(background,text) + .05);
  })()`)
  assert(lightTextContrast >= 4.5, 'Light theme body text meets a 4.5:1 contrast ratio')
  for (const width of [320, 390, 768, 1440]) {
    await viewport(width, 900, width < 600)
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Light theme has no overflow at ${width}px`)
    assert(await evaluate('(() => { const r=document.querySelector(".theme-toggle").getBoundingClientRect(); return r.left>=0 && r.right<=innerWidth && r.height>=44 })()'), `Theme control stays accessible at ${width}px`)
  }
  await click('.project-card .project-open')
  assert(await evaluate('getComputedStyle(document.querySelector("dialog")).backgroundColor === "rgb(255, 255, 255)"'), 'Project details use the light palette')
  await screenshot('desktop-light-dialog')
  await key('Escape', 'Escape', 27)
  await viewport(390,844,true)
  await evaluate('window.scrollTo({top:0,behavior:"instant"})')
  await screenshot('mobile-light')
  await click('.project-card .project-open')
  assert(await evaluate('document.querySelector("dialog").scrollWidth <= document.querySelector("dialog").clientWidth'), 'Light project details fit the mobile screen')
  await screenshot('mobile-light-dialog')
  await click('dialog .icon-button')
  await viewport(1440,1000)
  const lightHeight = await evaluate('document.documentElement.scrollHeight')
  for (let y=0;y<lightHeight;y+=650) {
    await evaluate(`window.scrollTo({top:${y},behavior:'instant'})`)
    await delay(110)
  }
  await evaluate('window.scrollTo({top:0,behavior:"instant"})')
  await screenshot('desktop-light-full',true)
  await evaluate('document.querySelector("#work").scrollIntoView({behavior:"instant"})')
  await screenshot('desktop-light-work')
  await click('.theme-toggle')
  assert(await evaluate('document.documentElement.dataset.theme === "dark" && localStorage.getItem("portfolio-theme") === "dark"'), 'Toggle returns to dark mode and saves it')
  await send('Page.reload')
  await ready()
  assert(await evaluate('document.documentElement.dataset.theme === "dark" && getComputedStyle(document.body).backgroundColor === "rgb(0, 0, 0)"'), 'Dark theme also survives reload')
  assert(errors.length === 0, `No browser errors (${errors.join('; ')})`)
  await writeFile(path.join(artifacts, 'qa-results.json'), JSON.stringify({ checks, errors }, null, 2))
  console.log(JSON.stringify({ passed: checks.length, errors, artifacts }, null, 2))
  }
} catch (error) {
  await writeFile(path.join(artifacts, 'qa-results.json'), JSON.stringify({ checks, errors, failure: error.message }, null, 2))
  console.error(error)
  process.exitCode = 1
} finally {
  socket?.close()
  chrome.kill()
  for (const { timeout } of pending.values()) clearTimeout(timeout)
}
