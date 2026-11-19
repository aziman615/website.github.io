const email = 'aziman605@gmail.com'
const projects = [
  {
    id: 'meters', type: 'AFTER-SALES OPERATIONS', title: 'Every meter. Every step.', name: 'Smart Meter After-Sales',
    description: 'Keeping more than 5,700 meter records moving, from collection and quality control to repair, packaging, and returns.',
    tags: ['Service management', '5,700+ records', 'Full-stack'], category: 'Platforms',
    challenge: 'A meter passes through several teams before it is ready to return. Keeping its history and current stage together matters at every handoff.',
    approach: 'A central service management application follows each record through collection, quality control, repair, packaging, and returns.',
    features: ['Meter record tracking', 'Quality control and repair stages', 'Packaging and return workflows'],
  },
  {
    id: 'management', type: 'ENTERPRISE PLATFORM', title: 'The bigger picture. In one place.', name: 'Smart Management System',
    description: 'Bringing asset management, operational tracking, and maintenance workflows into one connected workspace.',
    tags: ['Internal systems', 'Workflow design'], category: 'Platforms',
    challenge: 'Asset information, everyday operations, and maintenance all inform one another. They need a shared place to come together.',
    approach: 'A centralized platform connects these workflows so teams can follow the work in context.',
    features: ['Asset management', 'Operational tracking', 'Maintenance workflows'],
  },
  {
    id: 'alert', type: 'AUTOMATION', title: 'A little nudge. Right on time.', name: 'Smart Pro Alert',
    description: 'Automated email reminders that help teams stay ahead of equipment maintenance and renewal deadlines.',
    tags: ['Email automation', 'Maintenance'], category: 'Automation',
    challenge: 'Maintenance and renewal dates are easy to lose in the rhythm of daily work. Remembering them should not depend on repeated manual checks.',
    approach: 'Automated email notifications and reminders bring upcoming equipment maintenance and renewal deadlines to the people who need them.',
    features: ['Email notifications', 'Maintenance reminders', 'Renewal deadline tracking'],
  },
  {
    id: 'assets', type: 'ASSET LIFECYCLE', title: 'A story behind every asset.', name: 'Smart Asset System',
    description: 'A clearer view of assets through their lifecycle, with complaint logging and reporting built in.',
    tags: ['Asset tracking', 'Reporting'], category: 'Platforms',
    challenge: 'An asset has a history beyond its current status. Teams need to follow changes, record complaints, and report on the bigger picture.',
    approach: 'A dedicated system manages active, spoiled, dormant, and disposed assets alongside complaint logs and reporting.',
    features: ['Asset lifecycle tracking', 'Complaint logging', 'Asset reporting'],
  },
  {
    id: 'operations', type: 'CROSS-DEPARTMENT OPERATIONS', title: 'Different teams. Shared momentum.', name: 'Smart Operation System',
    description: 'Connecting workflows across Finance, Administration, Quality Assurance, Warehouse, and Production.',
    tags: ['Collaboration', 'Operations'], category: 'Platforms',
    challenge: 'Work rarely stays inside one department. A shared workflow needs to make sense to every team involved.',
    approach: 'A common platform brings together workflows across Finance, Administration, Quality Assurance, Warehouse, and Production.',
    features: ['Cross-department workflows', 'Shared operational workspace', 'Connected teams'],
  },
]

const jobs = [
  { date: 'NOV 2025 — PRESENT', title: 'Software Engineer', company: 'Smart Meters Technologies (M) Sdn. Bhd.', description: 'The sole software engineer on the Technologies team. Taking internal systems from the first requirements conversation through design, development, testing, and deployment.' },
  { date: 'MAR 2025 — JUN 2025', title: 'Web Development Intern', company: 'Universiti Teknikal Malaysia Melaka', description: 'Built registration, article submission, and payment workflows for the IUCEL 2025 portal using PHP, Laravel, and MySQL.' },
  { date: 'JUL 2019 — SEP 2019', title: 'Web Developer Intern', company: 'Aerodyne Geospatial Sdn. Bhd.', description: 'Developed Laravel web application features alongside senior developers across the software development lifecycle.' },
]


export { email, projects, jobs }
