import React, { useEffect, useRef, useState } from 'react'
import { email, projects, jobs } from './data'
import './style.css'

const techGroups = [
  { title: 'Core stack I work with', items: [
    ['React', 'react', '#19c6ed'], ['JavaScript', 'javascript', '#f0d543'], ['Node.js', 'nodejs', '#72b454'], ['Laravel', 'laravel', '#ff635d'], ['PHP', 'php', '#a0a8e5'],
  ] },
  { title: 'UI & styling', items: [
    ['Ant Design', 'antdesign', '#298bff'], ['Tailwind CSS', 'tailwindcss', '#20c6de'], ['HTML', 'html5', '#ed7249'], ['CSS', 'css3', '#379bff'], ['ReactFlow', 'flow', '#c79bf4'],
  ] },
  { title: 'Databases I use', items: [
    ['MySQL', 'mysql', '#49acde'], ['Oracle', 'oracle', '#ff5b56'],
  ] },
  { title: 'Beyond the browser', items: [
    ['Python', 'python', '#f1d35d'], ['Java', 'java', '#fb8259'], ['C++', 'cplusplus', '#4b99e5'], ['Android', 'android', '#8ed263'], ['YOLO', 'eye', '#ab92fa'], ['Testing & QA', 'check', '#69dfbd'],
  ] },
]

function Icon({ name, ...props }) {
  const paths = {
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    moon: <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />,
    linkedin: <><path fill="currentColor" stroke="none" d="M5.3 3a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6ZM3.3 9h4v12h-4V9Zm6.5 0h3.8v1.64h.06C14.19 9.6 15.49 8.5 17.4 8.5c4 0 4.6 2.6 4.6 5.97V21h-4v-5.78c0-1.38-.03-3.16-1.92-3.16-1.93 0-2.23 1.51-2.23 3.06V21h-4V9Z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    code: <><path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" /></>,
    flow: <><rect x="2" y="2" width="7" height="5" rx="1" /><rect x="15" y="17" width="7" height="5" rx="1" /><rect x="2" y="17" width="7" height="5" rx="1" /><path d="M5.5 7v10M5.5 12h13v5" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    cube: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" /><path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5V14" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 8 3 8 3 10H3c0-2 3-2 3-10Zm4 13h4" /></>,
  }
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}

function SocialLinks({ className = '' }) {
  return <div className={`social-links ${className}`}>
    <a className="glass-icon social-linkedin" href="https://www.linkedin.com/in/ahmad-aziman-azlan" target="_blank" rel="noreferrer" aria-label="Visit my LinkedIn"><Icon name="linkedin" /><span className="tooltip">LinkedIn</span></a>
    <a className="glass-icon social-email" href={`mailto:${email}`} aria-label="Send me an email"><Icon name="mail" /><span className="tooltip">Email me</span></a>
  </div>
}

function Reveal({ children, className = '', as: Tag = 'div', ...props }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const node = ref.current
    node.dataset.reveal = 'pending'
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.dataset.reveal = 'visible'; observer.disconnect() }
    }, { threshold: 0.08 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return <Tag ref={ref} className={`reveal ${className}`} {...props}>{children}</Tag>
}

function SectionTitle({ first, second, className = '' }) {
  return <h2 className={`section-title ${className}`} aria-label={`${first} ${second}`}><span>{first}</span><span className="outline-text" aria-hidden="true">{second}</span></h2>
}

function ProjectVisual({ kind, name }) {
  return <div className={`project-visual visual-${kind}`} aria-hidden="true">
    <span className="visual-caption">INTERFACE CONCEPT</span>
    {kind === 'meters' && <div className="preview-window meter-preview"><div className="preview-bar"><span className="window-dots"><i /><i /><i /></span><span>meter / workspace</span><Icon name="code" /></div><div className="meter-content"><span className="mock-label">SERVICE OVERVIEW</span><div className="meter-stat"><div><strong>5,700<span>+</span></strong><p>Meter records. One connected journey.</p></div><div className="sync-ring"><Icon name="check" /></div></div><div className="service-stages">{['Collect', 'Inspect', 'Repair', 'Package', 'Return'].map((stage, i) => <div key={stage}><span className={i < 3 ? 'stage-complete' : ''}><Icon name={i < 3 ? 'check' : 'cube'} /></span><small>{stage}</small></div>)}</div></div></div>}
    {kind === 'management' && <div className="preview-window management-preview"><div className="preview-bar"><span className="window-dots"><i /><i /><i /></span><span>one connected workspace</span><Icon name="code" /></div><div className="management-content"><span className="mock-label">THE BIGGER PICTURE</span><h4>Everything, together.</h4><div className="management-tiles">{[['Assets', 'cube'], ['Operations', 'flow'], ['Maintenance', 'bell']].map(([label, icon]) => <div key={label}><Icon name={icon} /><span>{label}</span><i /><i /></div>)}</div><div className="mini-chart">{[32, 47, 39, 62, 55, 78, 65, 88, 76, 98, 85, 110].map((height, i) => <i key={i} style={{ height: `${height / 1.2}%` }} />)}</div></div></div>}
    {kind === 'alert' && <div className="notification-concept"><span className="notification-orbit" /><div className="notification-icon"><Icon name="bell" /></div><div className="notification-message"><span className="mock-label">SMART PRO ALERT</span><h4>One less thing<br />to remember.</h4><p>Maintenance & renewal reminders</p><span className="notification-status"><Icon name="check" /> Right message. Right moment.</span></div></div>}
    {kind === 'assets' && <div className="asset-concept"><div className="asset-ring" /><div className="asset-ring second-ring" /><div className="asset-core"><Icon name="cube" /></div><span className="asset-tag tag-active">Active</span><span className="asset-tag tag-dormant">Dormant</span><span className="asset-tag tag-spoiled">Spoiled</span><span className="asset-tag tag-disposed">Disposed</span></div>}
    {kind === 'operations' && <div className="team-concept"><svg className="team-connectors" viewBox="0 0 480 280"><path d="M240 140 85 60M240 140 390 60M240 140 85 220M240 140 390 220M240 140V28" /></svg><div className="team-core"><Icon name="flow" /><span>In it together.</span></div><span className="team-tag team-finance">Finance</span><span className="team-tag team-qa">Quality Assurance</span><span className="team-tag team-warehouse">Warehouse</span><span className="team-tag team-production">Production</span><span className="team-tag team-admin">Administration</span></div>}
  </div>
}

function ProjectCard({ project, onOpen }) {
  return <Reveal as="article" className="project-card"><ProjectVisual kind={project.id} name={project.name} /><div className="project-copy"><span className="project-category">{project.type}</span><h3><button className="project-title-button" onClick={() => onOpen(project)}>{project.name}</button></h3><p>{project.description}</p><div className="project-bottom"><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><button className="project-open" onClick={() => onOpen(project)} aria-label={`Read about ${project.name}`}><Icon name="plus" /></button></div></div></Reveal>
}

function ProjectDialog({ project, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current, previous = document.activeElement, overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <dialog ref={ref} className="project-dialog" aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === ref.current) onClose() }}><div className="dialog-inner"><div className="dialog-top"><span className="eyebrow">A CLOSER LOOK</span><button className="icon-button" onClick={onClose} aria-label="Close project details"><Icon name="close" /></button></div><span className="project-category">{project.type}</span><h2 id="dialog-title">{project.name}</h2><p className="dialog-intro">{project.description}</p><div className="dialog-columns"><div><h3>The challenge</h3><p>{project.challenge}</p></div><div><h3>The approach</h3><p>{project.approach}</p></div></div><div className="dialog-features"><h3>Inside the system</h3>{project.features.map(feature => <span key={feature}><Icon name="check" />{feature}</span>)}</div><div className="dialog-footer"><p>An internal system. Let’s talk about the thinking behind it.</p><a className="glass-button" href={`mailto:${email}`}>Start a conversation</a></div></div></dialog>
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark' }
    catch { return 'dark' }
  })
  const [filter, setFilter] = useState('All work')
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const copyTimer = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f6f9fc' : '#000000')
    try { localStorage.setItem('portfolio-theme', theme) } catch {}
  }, [theme])

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true); setCopyError(false)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 3000)
    } catch { setCopyError(true) }
  }

  function moveGlow(event) {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    heroRef.current.style.setProperty('--glow-x', `${(event.clientX - rect.left) / rect.width * 100}%`)
    heroRef.current.style.setProperty('--glow-y', `${(event.clientY - rect.top) / rect.height * 100}%`)
  }

  const visibleProjects = projects.filter(project => filter === 'All work' || project.category === filter)

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'light'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
    <main id="main">
      <section ref={heroRef} className="hero" id="top" onPointerMove={moveGlow} onPointerLeave={() => { heroRef.current.style.setProperty('--glow-x', '50%'); heroRef.current.style.setProperty('--glow-y', '48%') }}>
        <nav className="hero-navigation" aria-label="Explore my portfolio"><a className="glass-button float-link float-about" href="#about">About Me</a><a className="glass-button float-link float-work" href="#work">My Work</a><a className="glass-button float-link float-tech" href="#tech">Tech Stack</a></nav>
        <div className="hero-intro"><p className="hero-greeting">Hi, I am</p><h1>AZIMAN</h1><p className="hero-role">Full Stack Developer</p><p className="hero-location">Shah Alam, Malaysia</p></div>
        <SocialLinks className="hero-socials" />
      </section>

      <section className="about section container" id="about"><Reveal className="section-heading about-heading"><SectionTitle first="ABOUT" second="ME" /></Reveal><div className="about-content"><Reveal className="bio-panel"><p className="bio-intro"><span aria-hidden="true"></span> Hey, I’m Ahmad Aziman, a Full Stack Developer.</p><p>I build web applications that make everyday work simpler. From connected internal systems to automated reminders, I enjoy turning complex workflows into practical, intuitive experiences.</p><p>Curious by nature, I like understanding how people work, solving problems, and taking an idea all the way from the first conversation to working software.</p></Reveal><Reveal className="experience" id="experience"><h3 className="chapter-heading">EXPERIENCE</h3><div className="timeline">{jobs.map((job, i) => <article className="job" key={job.company}><span className="timeline-dot" aria-hidden="true" /><h4>{job.title}</h4><p className="job-meta">{job.company}</p><p className="job-date">{job.date}{i === 0 && <span className="current-label">CURRENT</span>}</p><p className="job-description">{job.description}</p></article>)}</div></Reveal><Reveal className="education"><h3 className="chapter-heading">EDUCATION</h3><div className="timeline"><article className="job"><span className="timeline-dot" aria-hidden="true" /><h4>Bachelor of Computer Science with Honours</h4><p className="job-meta">Universiti Teknologi MARA</p><p className="job-date">2022 — 2025</p><p className="job-description">Final year project: Chili Disease and Pest Detection System.</p></article><article className="job"><span className="timeline-dot" aria-hidden="true" /><h4>Diploma in Computer Science</h4><p className="job-meta">Universiti Teknologi MARA</p></article></div></Reveal></div></section>

      <section className="tech section container" id="tech"><Reveal className="section-heading tech-heading"><SectionTitle first="TECH" second="SET" /></Reveal><div className="tech-content">{techGroups.map(group => <Reveal className="tech-group" key={group.title}><h3>{group.title}</h3><div className="tech-list">{group.items.map(([label, icon, color]) => <div className="tech-item" key={label} style={{ '--brand': color }}><div className="tech-tile">{['flow', 'eye', 'check'].includes(icon) ? <Icon name={icon} /> : <img src={`${import.meta.env.BASE_URL}icons/${icon}.svg`} alt="" width="36" height="36" loading="lazy" />}</div><span>{label}</span></div>)}</div></Reveal>)}</div></section>

      <section className="work section container" id="work"><Reveal className="work-heading"><SectionTitle first="MY" second="WORK" /><p>Useful software. Real-world problems.<br />A selection of the systems I’ve built.</p></Reveal><div className="work-toolbar"><div className="filters" role="group" aria-label="Filter projects">{['All work', 'Platforms', 'Automation'].map(option => <button key={option} className={filter === option ? 'active' : ''} aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>)}</div><span className="work-count" role="status">{visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}</span></div><div className="project-grid">{visibleProjects.map(project => <ProjectCard key={project.id} project={project} onOpen={setSelected} />)}</div><p className="work-note">Internal systems, shared through interface concepts and project stories.</p></section>

      <section className="contact section container" id="contact"><Reveal><p className="eyebrow">HAVE AN IDEA OR AN OPPORTUNITY?</p><h2>LET’S <span>CONNECT.</span></h2><p className="contact-copy">I’m always happy to talk about useful software,<br className="desktop-break" /> interesting challenges, and what we could build together.</p><div className="email-line"><a href={`mailto:${email}`}>{email}</a><button className="copy-button" onClick={copyEmail} aria-label={copied ? 'Email address copied' : 'Copy email address'}><Icon name={copied ? 'check' : 'copy'} /><span>{copied ? 'Copied!' : 'Copy email'}</span></button></div><span className="sr-only" role="status">{copied ? 'Email address copied to clipboard.' : copyError ? `Please copy the address directly: ${email}` : ''}</span>{copyError && <p className="copy-error">Select the email address to copy it.</p>}<SocialLinks className="contact-socials" /></Reveal><footer><a className="footer-brand" href="#top">AZIMAN<span>.</span></a><span>© {new Date().getFullYear()} Ahmad Aziman Bin Azlan</span><a className="back-top" href="#top">Back to top</a></footer></section>
    </main>
    {selected && <ProjectDialog project={selected} onClose={() => setSelected(null)} />}
  </>
}
