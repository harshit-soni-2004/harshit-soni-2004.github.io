import type { SkillGroup } from './types';

/**
 * Skill groups. `level` (0-100) is optional: if set, the skill renders with a neon bar;
 * otherwise as a tag. Levels are intentionally left unset — add them only if you want bars.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'cloud-devops',
    title: 'Cloud / DevOps',
    skills: [
      { name: 'AWS EC2 / AMI' },
      { name: 'Amazon EKS' },
      { name: 'VPC / ALB' },
      { name: 'IAM' },
      { name: 'SSM' },
      { name: 'S3' },
      { name: 'Lambda' },
      { name: 'EventBridge' },
      { name: 'SES' },
      { name: 'RDS' },
      { name: 'Secrets Manager' },
      { name: 'Terraform' },
      { name: 'Docker' },
      { name: 'Docker Compose' },
      { name: 'containerd / kubelet' },
      { name: 'Bitbucket Pipelines' },
      { name: 'Jenkins' },
      { name: 'Maven' },
      { name: 'Linux (AlmaLinux / RHEL 9, Ubuntu)' },
      { name: 'systemd / cloud-init' },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    skills: [
      { name: 'Trivy' },
      { name: 'CIS benchmarks' },
      { name: 'auditd' },
      { name: 'SELinux' },
      { name: 'AIDE' },
      { name: 'Vulnerability management' },
      { name: 'Least privilege' },
      { name: 'JWT (RSA)' },
      { name: 'Jasypt' },
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    skills: [
      { name: 'Java 21' },
      { name: 'Python' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'SQL' },
      { name: 'Bash' },
      { name: 'C++' },
      { name: 'C' },
    ],
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    skills: [
      { name: 'Spring Boot 3' },
      { name: 'Spring Cloud (Gateway, Eureka)' },
      { name: 'Spring Security' },
      { name: 'JPA / Hibernate' },
      { name: 'REST' },
      { name: 'gRPC' },
      { name: 'Angular 20' },
      { name: 'React' },
    ],
  },
  {
    id: 'data',
    title: 'Data & Messaging',
    skills: [{ name: 'MySQL' }, { name: 'Flyway' }, { name: 'Redis' }, { name: 'RabbitMQ' }],
  },
  {
    id: 'ml',
    title: 'ML / AI',
    skills: [
      { name: 'TensorFlow' },
      { name: 'Scikit-learn' },
      { name: 'OpenCV' },
      { name: 'NumPy' },
      { name: 'Pandas' },
      { name: 'Matplotlib' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    skills: [
      { name: 'Git / GitHub' },
      { name: 'boto3' },
      { name: 'pytest' },
      { name: 'JUnit' },
      { name: 'Postman' },
      { name: 'Power BI' },
      { name: 'Tableau' },
    ],
  },
  {
    id: 'core',
    title: 'Core CS',
    skills: [
      { name: 'Data Structures & Algorithms' },
      { name: 'OOP' },
      { name: 'DBMS' },
      { name: 'System Design' },
    ],
  },
];
