import type { Project } from './types';

/**
 * Projects. Add a new object to this array and it automatically appears in:
 * the card grid, tag filters, search, the `projects` / `open <id>` terminal commands,
 * About stats, and the deep link #/projects/<id>.
 *
 * `id` must be unique and URL-safe (lowercase, dashes).
 */
export const projects: Project[] = [
  {
    id: 'resumegap',
    title: 'ResumeGap — AI Resume & ATS Gap Copilot',
    summary:
      'AI resume and ATS gap copilot that scores resumes deterministically and rewrites bullets in Google XYZ format.',
    description:
      '0-to-1 AI Resume and ATS Gap Copilot built for off-campus engineering grads. Pairs a deterministic TypeScript audit engine (400+ skill keywords, metric regexes, seniority and section checks) with Gemini 2.5 Flash to generate priority-tagged missing keywords and Google XYZ bullet rewrites with [X%] placeholders to prevent metric hallucination.',
    highlights: [
      'Two-stage hybrid pipeline: sub-30ms deterministic ATS audit (keyword overlap 50%, quantified impact 25%, seniority 15%, completeness 10%) plus Gemini 2.5 Flash structured JSON rewrites.',
      'Enforces a zero-hallucination guardrail by injecting [X%] placeholders wherever original bullets lack hard metrics.',
      'Interactive Accept/Reject/Copy diff cards for Google XYZ bullet rewrites and priority-ranked (HIGH/MEDIUM/LOW) missing keyword chips.',
      'Zero-signup PDF upload via unpdf with no resume persistence, Upstash Redis rate limiting, and a protected /admin PM analytics dashboard tracking bullet edit acceptance rate.',
    ],
    tags: ['SDE', 'Full Stack', 'AI'],
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Gemini API', 'Supabase', 'Upstash Redis'],
    demo: 'https://resumegap-npxlhydwy-iharshsoni-gmailcoms-projects.vercel.app/',
    github: 'https://github.com/harshit-soni-2004/resumegap',
    image: 'projects/resumegap.jpg',
    imageAlt:
      'ResumeGap ATS Audit view showing a 76 out of 100 ATS score gauge and four weighted evaluation pillars: Keyword Overlap, Quantified Impact Ratio, Seniority & Role Match, and Section Completeness.',
    featured: true,
    date: '2026-11',
    context: 'Personal',
  },
  {
    id: 'concave-survey-system',
    title: 'Concave Insights — Custom Survey System',
    summary:
      'Tag-driven market research survey platform that parses plain .txt questionnaires into live, quota-enforced studies.',
    description:
      'Resilient survey intelligence engine for 15-day consumer research cycles. Researchers upload plain .txt questionnaires in a domain-specific tag format; the platform validates syntax and semantics with line-level accuracy, freezes immutable versions on approval, runs mobile-first respondent sessions with autosave, and exports unified CSV/Excel datasets.',
    highlights: [
      'Line-aware questionnaire parser and validator supporting 13 question types, nested quotas, and bilingual (Hindi/English) tags.',
      'Logic engine with show-if (AND/OR precedence), skip-to, piping, options-from, balanced concept rotation, and per-respondent matrix row shuffling.',
      'Multi-reason screener chaining, atomic quota concurrency locking, and runtime speeder and straight-liner quality flags.',
      'Portfolio dashboard with live study metrics, drop-off funnel analytics, and standardized CSV/Excel (openpyxl) exports.',
    ],
    tags: ['SDE', 'Full Stack'],
    tech: ['Angular', 'TypeScript', 'FastAPI', 'Python', 'PostgreSQL', 'Docker'],
    demo: 'https://concave-survey-system.vercel.app',
    github: 'https://github.com/harshit-soni-2004/concave-survey-system',
    image: 'projects/concave-survey.jpg',
    imageAlt:
      'ConcaveInsights Portfolio Dashboard showing live studies, total completes, in-progress sessions, completes-per-day chart, and studies-by-status donut chart.',
    featured: true,
    date: '2026-11',
    context: 'Personal',
  },
  {
    id: 'ami-patching-tool',
    title: 'Automated AMI Patching Tool',
    summary:
      'Scan → patch → rescan → bake pipeline that turns golden-AMI patching into an auditable, scheduled job.',
    description:
      'Built at Veefin to automate patching of the CIS-hardened AlmaLinux 9 golden AMI. The tool launches a temporary EC2 instance from the current golden image, scans it with Trivy, patches it through AWS Systems Manager (no SSH), rescans, and bakes a new date-stamped AMI. Before/after reports and a delta are emailed via SES so every patch cycle leaves an audit trail.',
    highlights: [
      'Launches a temporary EC2 instance from the golden AMI, scans with Trivy, patches via SSM, rescans and bakes a date-stamped AMI.',
      'Emails before-and-after vulnerability reports plus a delta through SES, making each patch cycle auditable.',
      'Scheduled with EventBridge and Jenkins.',
      'Covered by 56 unit tests (pytest).',
    ],
    tags: ['DevOps', 'Cloud', 'Security', 'Automation'],
    tech: ['Python', 'boto3', 'Trivy', 'AWS SSM', 'AWS SES', 'EventBridge', 'Jenkins', 'EC2 / AMI'],
    github: 'https://github.com/harshit-soni-2004/automated-patcher',
    featured: true,
    date: '2026-09', // TODO: confirm month
    context: 'Veefin',
  },
  {
    id: 'ec2-vuln-scanner',
    title: 'Automated EC2 Vulnerability Scanning & Reporting',
    summary:
      'Daily agentless Trivy scans of every running EC2 instance over SSM, with emailed reports and a security-group exposure scanner.',
    description:
      'A scheduled job that scans every running EC2 instance with Trivy through AWS Systems Manager — no SSH access needed — and emails a consolidated vulnerability report to the Head of DevOps via SES. Extended with a security-group exposure scanner that produces scheduled HTML, XLSX and CSV reports.',
    highlights: [
      'Daily cron job scans every running EC2 instance with Trivy through SSM, with no SSH access.',
      'Generates a vulnerability report and emails it to the Head of DevOps via SES.',
      'Built a security-group exposure scanner with scheduled HTML / XLSX / CSV reports.',
      'Covered by 61 unit tests.',
    ],
    tags: ['DevOps', 'Cloud', 'Security', 'Automation'],
    tech: ['Python', 'Trivy', 'AWS SSM', 'AWS SES', 'EC2', 'cron'],
    github: 'https://github.com/harshit-soni-2004/security-scanner',
    featured: true,
    date: '2026-08', // TODO: confirm month
    context: 'Veefin',
  },
  {
    id: 'spendsense',
    title: 'Mintmate — Personal Finance Platform',
    summary:
      'Solo full-stack app that imports Indian bank statements, categorizes spending, and explains the numbers with a tool-calling assistant.',
    description:
      'An end-to-end personal finance platform built solo with Angular, Spring Boot and MySQL. It imports statements from major Indian banks, removes duplicates, pairs both legs of internal transfers so self-transfers are not counted as spending, and categorizes merchants. On top of that sit budgets, goals, debts and anomaly analytics, plus an assistant that only explains server-calculated numbers and asks for confirmation before changing any record.',
    highlights: [
      'Imports PDF, CSV and Excel statements from SBI, HDFC, ICICI, Axis and Kotak, with duplicate detection.',
      'Matches opposing legs of internal transfers (amount, date window, UTR/RRN) so self-transfers are not counted as spending.',
      "Categorizes merchants with rules, the user's past corrections and a confidence-gated ML model.",
      'Budgets, goals, debts and analytics (budget breaches, spend anomalies).',
      'Tool-calling assistant explains server-calculated numbers and asks for confirmation before changing any record.',
      'API secured with JWT and user-scoped queries.',
    ],
    tags: ['SDE', 'Full Stack', 'ML'],
    tech: ['Angular', 'TypeScript', 'Spring Boot', 'Java', 'MySQL', 'JWT'],
    demo: 'https://mintmate-lyart.vercel.app/login',
    github: 'https://github.com/harshit-soni-2004/-Mintmate',
    image: 'projects/mintmate-dashboard.jpg',
    imageAlt:
      'Mintmate dashboard: available balance and cashflow chart, net savings, income, total spent and savings rate, with a proactive spending insight and the AI assistant button.',
    featured: true,
    date: '2026-10',
    context: 'Personal',
  },
  {
    id: 'invoice-financing-platform',
    title: 'Invoice Financing Platform',
    summary:
      'Event-driven microservices where sellers get early payment on invoices and financiers compete with offers — OAuth2, outbox, idempotent money ops.',
    description:
      'A portfolio simulation of invoice financing: sellers upload and verify invoices, financiers bid, agreements drive simulated disbursement and repayment schedules with overdue penalties, notifications and a tamper-resistant audit trail. Six Spring Boot services behind a gateway, each with its own MySQL database, coordinated only through RabbitMQ events.',
    highlights: [
      'Spring Authorization Server with Authorization Code + PKCE; RS256 JWTs validated at the gateway and in every service.',
      'Transactional outbox with idempotent consumers, delayed retry tiers and per-queue dead-letter queues.',
      'Idempotent disbursement and repayment with row locking, Idempotency-Key headers and optimistic locking via ETag / If-Match.',
      'Angular 21 SPA, Docker Compose local stack, GitHub Actions CI.',
    ],
    tags: ['SDE', 'Full Stack', 'Cloud'],
    tech: [
      'Spring Boot',
      'Java',
      'Angular',
      'MySQL',
      'RabbitMQ',
      'Redis',
      'OAuth2',
      'Docker Compose',
      'GitHub Actions',
    ],
    demo: 'https://dictionaries-amber-pays-enzyme.trycloudflare.com/',
    github: 'https://github.com/harshit-soni-2004/invoice-financing-platform',
    image: 'projects/invoice-financing-seller.jpg',
    imageAlt:
      'Invoice Financing seller dashboard: greeting for Harshit Soni, quick actions for invoices and notifications, and potential buyers directory with credit ratings and payment metrics.',
    featured: true,
    date: '2026-10',
    context: 'Personal',
  },
  {
    id: 'ledger',
    title: 'Ledger & Bank Reconciliation',
    summary:
      'Double-entry ledger with bank statement import and reconciliation — Java 21, Spring Boot, MySQL 8.4.',
    description:
      'A backend-focused accounting module that models accounts and journal entries under double-entry rules, imports bank statements, and matches transactions for reconciliation. Built as a clean Spring Boot service with MySQL for durable financial records.',
    highlights: [
      'Double-entry journal posting with balanced debits and credits.',
      'Bank statement import and reconciliation workflow.',
      'Java 21 and Spring Boot with MySQL 8.4.',
    ],
    tags: ['SDE', 'Full Stack'],
    tech: ['Java 21', 'Spring Boot', 'MySQL'],
    github: 'https://github.com/harshit-soni-2004/ledger',
    date: '2026-09',
    context: 'Personal',
  },
  {
    id: 'terraform-modules',
    title: 'AWS Terraform Modules',
    summary:
      'Reusable Terraform modules for EC2, S3 and RDS plus shared developer-platform infrastructure patterns.',
    description:
      'A library of composable Terraform modules used to standardize AWS provisioning — compute, object storage and relational databases — with consistent tagging, networking and security defaults suitable for internal developer platforms.',
    highlights: [
      'Reusable modules for EC2, S3 and RDS.',
      'Shared patterns for developer-platform infrastructure on AWS.',
    ],
    tags: ['DevOps', 'Cloud'],
    tech: ['Terraform', 'HCL', 'AWS'],
    github: 'https://github.com/harshit-soni-2004/terraform-modules',
    date: '2026-08',
    context: 'Veefin',
  },
  {
    id: 'ami-hardening',
    title: 'AMI CIS Hardening & SSH Management',
    summary:
      'CIS benchmark hardening deltas and automated team SSH key management for Linux golden AMIs.',
    description:
      'Shell automation and configuration deltas that harden AlmaLinux AMIs against CIS benchmarks, plus tooling to manage developer SSH access on shared golden images without manual drift.',
    highlights: [
      'CIS-oriented hardening deltas applied to Linux AMIs.',
      'Automated team SSH key management for shared golden images.',
    ],
    tags: ['DevOps', 'Cloud', 'Security'],
    tech: ['Shell', 'Linux', 'CIS', 'AWS EC2 / AMI'],
    github: 'https://github.com/harshit-soni-2004/ami-hardening',
    date: '2026-07',
    context: 'Veefin',
  },
  {
    id: 'lab-reservation',
    title: 'Lab Reservation System',
    summary:
      'Secure full-stack lab booking system for the department with conflict validation and role-based access.',
    description:
      'A department project to manage academic lab reservations. Built with Spring Boot, MySQL and React, it exposes REST APIs for slot creation, booking and conflict validation, and secures access with JWT and role-based permissions for admins, faculty and students.',
    highlights: [
      'Designed REST APIs for slot creation, booking and conflict validation, reducing double-booking incidents by 90%.',
      'Implemented JWT authentication and role-based access control (Admin, Faculty, Student).',
    ],
    tags: ['SDE', 'Full Stack'],
    tech: ['Spring Boot', 'Java', 'MySQL', 'React', 'JWT'],
    // TODO: add GitHub link.
    date: '2025-06', // TODO: confirm date
    context: 'Department project',
  },
];
