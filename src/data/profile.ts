import type { Profile } from './types';

export const profile: Profile = {
  name: 'Harshit Soni',
  handle: 'harshit',
  titles: ['DevOps Engineer', 'Software Engineer (SDE)', 'Researcher'],
  tagline:
    'I harden cloud infrastructure, automate the boring parts, and ship full-stack features end to end.',
  bio: [
    'Software engineer working across AWS infrastructure, DevOps automation and full-stack Java / Angular development. At Veefin I patched and hardened golden AMIs, built the company’s first arm64 Amazon EKS worker image, wrote Terraform modules, and shipped Spring Boot + Angular features.',
    'I enjoy root-causing the weird failures — systemd ordering loops, broken CI runners, migrations that only worked in QA — and turning the fix into a runbook or a tool so it never happens again.',
    'On the research side I am a Junior Research Lead at DJ InIT.AI, where I organize technical workshops, and I have worked on Indian Sign Language recognition and cross-lingual NLP.',
  ],
  location: 'Mumbai, India',
  email: 'iharshsoni@gmail.com',
  // Uncomment to show your phone number publicly on the site:
  // phone: '+91 8369218446',
  availability: 'Immediate joiner',
  resumePath: 'resume/Harshit_Soni_Resume.pdf',
  socials: [
    { label: 'GitHub', url: 'https://github.com/harshit-soni-2004', handle: 'harshit-soni-2004' },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/harshit-soni-871798279',
      handle: 'in/harshit-soni-871798279',
    },
    { label: 'Email', url: 'mailto:iharshsoni@gmail.com', handle: 'iharshsoni@gmail.com' },
  ],
  interests: [
    'Football: DJ Sanghvi college team, MFA second division and inter-school tournaments',
    'Hackathons',
  ],
};
