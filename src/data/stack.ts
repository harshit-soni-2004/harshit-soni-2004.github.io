import type { StackLayer } from './types';

/**
 * The tech stack, top (what users see) to bottom (where it runs). Each item is matched as a
 * whole word against the `tech` lists in projects.ts and research.ts to show where it is used,
 * so 'Spring Boot' counts a project listing 'Spring Boot' and 'EC2' counts 'EC2 / AMI'.
 */
export const stackLayers: StackLayer[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    blurb: 'Single-page apps and dashboards.',
    items: ['Angular', 'TypeScript', 'React', 'JavaScript', 'Three.js'],
  },
  {
    id: 'backend',
    title: 'Backend & APIs',
    blurb: 'Services, auth and business logic.',
    items: ['Java', 'Spring Boot', 'Spring Security', 'Spring Cloud Gateway', 'OAuth2', 'JWT', 'REST', 'gRPC', 'Python'],
  },
  {
    id: 'data',
    title: 'Data & Messaging',
    blurb: 'Storage, caching and event-driven integration.',
    items: ['MySQL', 'Flyway', 'Redis', 'RabbitMQ'],
  },
  {
    id: 'ml',
    title: 'ML / AI',
    blurb: 'Vision, NLP and multimodal research models.',
    items: [
      'PyTorch',
      'TensorFlow',
      'Hugging Face',
      'Transformer',
      'LoRA',
      'RAG',
      'OpenCV',
      'Scikit-learn',
      'GPT-4',
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud (AWS)',
    blurb: 'Where it runs.',
    items: ['EC2', 'EKS', 'SSM', 'SES', 'S3', 'RDS', 'Lambda', 'EventBridge', 'IAM', 'VPC'],
  },
  {
    id: 'devops',
    title: 'DevOps & Security',
    blurb: 'Infrastructure as code, pipelines and hardening.',
    items: [
      'Terraform',
      'Docker',
      'Docker Compose',
      'GitHub Actions',
      'Jenkins',
      'Bitbucket Pipelines',
      'Linux',
      'Shell',
      'Trivy',
      'CIS',
    ],
  },
  {
    id: 'testing',
    title: 'Testing & Tools',
    blurb: 'Keeping it correct.',
    items: ['JUnit', 'pytest', 'Postman', 'Git'],
  },
];
