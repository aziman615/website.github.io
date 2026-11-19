import { mkdir, writeFile } from 'node:fs/promises'

// Keep the portfolio's technology marks local, with no runtime CDN dependency.
const icons = [
  ['react', 'react-original'], ['javascript', 'javascript-original'],
  ['nodejs', 'nodejs-original'], ['laravel', 'laravel-original'], ['php', 'php-original'],
  ['antdesign', 'antdesign-original'], ['tailwindcss', 'tailwindcss-original'],
  ['html5', 'html5-original'], ['css3', 'css3-original'],
  ['mysql', 'mysql-original'], ['oracle', 'oracle-original'],
  ['python', 'python-original'], ['java', 'java-original'],
  ['cplusplus', 'cplusplus-original'], ['android', 'android-original'],
]
await mkdir('public/icons', { recursive: true })
const results = await Promise.allSettled(icons.map(async ([directory, file]) => {
  const response = await fetch(`https://raw.githubusercontent.com/devicons/devicon/master/icons/${directory}/${file}.svg`)
  if (!response.ok) throw new Error(`${directory}: HTTP ${response.status}`)
  const svg = await response.text()
  if (!svg.includes('<svg')) throw new Error(`Invalid SVG for ${directory}`)
  await writeFile(`public/icons/${directory}.svg`, svg)
  return directory
}))
for (const result of results) {
  if (result.status === 'rejected') { console.error(result.reason.message); process.exitCode = 1 }
}
console.log(`${results.filter(result => result.status === 'fulfilled').length}/${icons.length} icons downloaded`)
