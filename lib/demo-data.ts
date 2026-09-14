import { Candidate, CandidateStatus, Job, MatchingWeights, Activity } from './matching/types'
import { scoreCandidate, DEFAULT_WEIGHTS } from './matching/score'
import { ModelVersion, INITIAL_MODELS } from './adaptive/engine'

export type { CandidateStatus, Candidate, Job, MatchingWeights, Activity }

export const jobs: Job[] = [
  { id: 'JOB-001', title: 'Machine Learning Engineer', department: 'Applied AI', required: ['Python', 'PyTorch', 'SQL', 'NLP'], preferred: ['Kubernetes', 'AWS'], education: 'BSc Computer Science', experience: '3+ years', candidates: 18, minimumCGPA: 7.5, cgpaScale: 10, cgpaMode: 'SOFT', cgpaWeight: 0.10, description: 'Design and deploy production NLP evaluation pipelines and PyTorch ML models.' },
  { id: 'JOB-002', title: 'Data Scientist', department: 'Research', required: ['Python', 'Statistics', 'SQL'], preferred: ['Experimentation', 'Spark'], education: 'MSc preferred', experience: '2+ years', candidates: 22, minimumCGPA: 8.0, cgpaScale: 10, cgpaMode: 'SOFT', cgpaWeight: 0.10, description: 'Analyze complex datasets, design A/B experiments, and build statistical predictive models.' },
  { id: 'JOB-003', title: 'Frontend Developer', department: 'Product Engineering', required: ['React', 'TypeScript', 'CSS'], preferred: ['Testing', 'Accessibility'], education: 'BSc or equivalent', experience: '3+ years', candidates: 27, minimumCGPA: 7.0, cgpaScale: 10, cgpaMode: 'SOFT', cgpaWeight: 0.10, description: 'Build responsive, accessible user interfaces using Next.js, React, and modern CSS.' },
  { id: 'JOB-004', title: 'Backend Engineer', department: 'Platform', required: ['Node.js', 'Postgres', 'APIs'], preferred: ['Docker', 'Cloud'], education: 'BSc or equivalent', experience: '4+ years', candidates: 31, description: 'Develop scalable microservices, REST APIs, and high-performance backend storage systems.' },
  { id: 'JOB-005', title: 'AI Research Intern', department: 'Research', required: ['Python', 'ML fundamentals'], preferred: ['NLP', 'PyTorch'], education: 'Currently enrolled', experience: '0–1 years', candidates: 30, minimumCGPA: 8.5, cgpaScale: 10, cgpaMode: 'HARD', cgpaWeight: 0.15, description: 'Conduct foundational AI research, literature benchmark studies, and model prototyping.' },
]

export const candidates: Candidate[] = [
  { id: 'C-1001', name: 'Ananya Rao', initials: 'AR', education: 'MSc Artificial Intelligence', experience: 4.2, cgpa: 8.8, cgpaScale: 10, skills: ['Python', 'PyTorch', 'NLP', 'SQL'], required: ['Python', 'PyTorch', 'NLP'], status: 'Recommended', location: 'Bengaluru, IN', fairness: 'Clear', summary: 'Built NLP evaluation pipelines and production ML services.', projects: ['NLP Evaluation Benchmarks', 'PyTorch Service Infra'] },
  { id: 'C-1002', name: 'Rahul Kumar', initials: 'RK', education: 'BTech Computer Science', experience: 3.8, cgpa: 8.2, cgpaScale: 10, skills: ['Python', 'TensorFlow', 'NLP', 'Docker'], required: ['Python', 'NLP', 'Docker'], status: 'Recommended', location: 'Pune, IN', fairness: 'Clear', summary: 'Strong semantic alignment with practical model deployment evidence.', projects: ['TensorFlow Model Serving'] },
  { id: 'C-1003', name: 'Priya Sharma', initials: 'PS', education: 'MSc Data Science', experience: 5.1, cgpa: 9.1, cgpaScale: 10, skills: ['Python', 'Scikit-learn', 'SQL', 'Statistics'], required: ['Python', 'SQL', 'Statistics'], status: 'Review', location: 'Delhi, IN', fairness: 'Review', summary: 'Experienced analyst with strong experimentation and stakeholder work.', projects: ['Predictive Analytics Dashboard'] },
  { id: 'C-1004', name: 'Omar Wilson', initials: 'OW', education: 'BSc Software Engineering', experience: 4.7, cgpa: 3.6, cgpaScale: 4, skills: ['Python', 'AWS', 'APIs', 'Docker'], required: ['Python', 'AWS', 'APIs'], status: 'Review', location: 'London, UK', fairness: 'Clear', summary: 'Good engineering depth; NLP evidence is less explicit.', projects: ['AWS Microservices Gateway'] },
  { id: 'C-1005', name: 'Sofia Marin', initials: 'SM', education: 'MSc Machine Learning', experience: 2.9, cgpa: 7.9, cgpaScale: 10, skills: ['Python', 'PyTorch', 'Computer Vision'], required: ['Python', 'PyTorch'], status: 'Review', location: 'Madrid, ES', fairness: 'Clear', summary: 'Relevant research projects with shorter professional experience.', projects: ['Vision Transformer Benchmark'] },
  { id: 'C-1006', name: 'Ethan Brooks', initials: 'EB', education: 'BSc Mathematics', experience: 6.2, cgpa: 3.4, cgpaScale: 4, skills: ['Python', 'Statistics', 'SQL', 'Spark'], required: ['Python', 'Statistics', 'SQL'], status: 'Review', location: 'Toronto, CA', fairness: 'Review', summary: 'Excellent statistical foundation; limited modern NLP tooling detected.', projects: ['Spark ETL Pipeline'] },
  { id: 'C-1007', name: 'Lina Park', initials: 'LP', education: 'BSc Computer Science', experience: 3.4, cgpa: 7.2, cgpaScale: 10, skills: ['Python', 'NLP', 'Transformers'], required: ['Python', 'NLP'], status: 'Hold', location: 'Seoul, KR', fairness: 'Clear', summary: 'Promising semantic match with gaps in production systems.', projects: ['Transformer Summarizer'] },
  { id: 'C-1008', name: 'Mateo Silva', initials: 'MS', education: 'BSc Information Systems', experience: 4.0, skills: ['SQL', 'Tableau', 'Python'], required: ['SQL', 'Python'], status: 'Hold', location: 'Lisbon, PT', fairness: 'Clear', summary: 'Broad analytics background; core deep learning evidence is limited.', projects: ['Tableau Executive Suite'] },
  { id: 'C-1009', name: 'Nia Okafor', initials: 'NO', education: 'MSc Computer Science', experience: 2.1, cgpa: 8.6, cgpaScale: 10, skills: ['Python', 'PyTorch', 'NLP', 'MLOps'], required: ['Python', 'PyTorch', 'NLP'], status: 'Review', location: 'Lagos, NG', fairness: 'Clear', summary: 'Strong project portfolio and skills coverage, early-career profile.', projects: ['MLOps Monitoring Pipeline'] },
  { id: 'C-1010', name: 'Leo Fischer', initials: 'LF', education: 'BSc Computer Engineering', experience: 7.0, cgpa: 3.8, cgpaScale: 4, skills: ['Python', 'C++', 'ML', 'Kubernetes'], required: ['Python', 'ML', 'Kubernetes'], status: 'Review', location: 'Berlin, DE', fairness: 'Review', summary: 'Deep engineering experience; resume uses varied role terminology.', projects: ['C++ High-Throughput Engine'] },
  { id: 'C-1011', name: 'Mina Patel', initials: 'MP', education: 'MEng AI Systems', experience: 3.2, cgpa: 8.9, cgpaScale: 10, skills: ['Python', 'NLP', 'SQL', 'AWS'], required: ['Python', 'NLP', 'SQL'], status: 'Recommended', location: 'Mumbai, IN', fairness: 'Clear', summary: 'Consistent evidence across required skills and project outcomes.', projects: ['AWS AI Service Integration'] },
  { id: 'C-1012', name: 'Sam Taylor', initials: 'ST', education: 'BSc Computer Science', experience: 1.8, skills: ['Python', 'React', 'SQL'], required: ['Python', 'React'], status: 'Hold', location: 'Manchester, UK', fairness: 'Clear', summary: 'Transferable technical foundation; experience threshold needs review.', projects: ['React Data Dashboard'] },
]

export const score = (c: Candidate, weights: MatchingWeights = DEFAULT_WEIGHTS, job: Job = jobs[0]) => {
  return scoreCandidate(c, job, weights).totalScore
}

export const seedActivities: Activity[] = [
  { id: 'act-1', time: '09:42', event: 'Resume parsed', subject: 'C-1011 Mina Patel', status: 'Complete' },
  { id: 'act-2', time: '09:44', event: 'Candidate scored', subject: 'C-1001 Ananya Rao', status: 'Complete' },
  { id: 'act-3', time: '09:46', event: 'Ranking updated', subject: 'JOB-001', status: 'Complete' },
  { id: 'act-4', time: '09:48', event: 'Fairness audit completed', subject: 'Synthetic groups A–C', status: 'Pass' },
  { id: 'act-5', time: '09:51', event: 'Explanation generated', subject: 'C-1002 Rahul Kumar', status: 'Complete' },
  { id: 'act-6', time: '09:54', event: 'Recruiter feedback received', subject: 'C-1003 Priya Sharma', status: 'Queued' },
  { id: 'act-7', time: '09:56', event: 'Model evaluation completed', subject: 'v1.3.2 → v1.3.3', status: 'Simulated' },
  { id: 'act-8', time: '09:58', event: 'Candidate status changed', subject: 'C-1001 Ananya Rao', status: 'Advanced' },
]

export const activities = seedActivities
export const experiments = ['TF-IDF Baseline', 'TF-IDF + ML', 'Sentence-BERT', 'Hybrid AI', 'Hybrid + XAI', 'Hybrid + Fairness', 'Full Adaptive Framework']
export const models: ModelVersion[] = INITIAL_MODELS
export const pipeline = ['Parsing', 'Semantic', 'Hybrid match', 'Ranking', 'XAI', 'Fairness', 'Feedback', 'Adaptation']
