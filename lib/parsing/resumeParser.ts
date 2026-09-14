import { Candidate } from '../matching/types'
import { extractCGPAFromText } from './cgpaParser'

export function parseRawResumeText(text: string, existingCount: number): Candidate {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const nameLine = lines[0] || `Candidate C-${1000 + existingCount + 1}`
  const name = nameLine.replace(/^name[:\s]*/i, '').slice(0, 30)
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CN'

  let expYears = 2.5
  const expMatch = text.match(/(\d+)\+?\s*years?/i)
  if (expMatch) {
    expYears = parseFloat(expMatch[1])
  }

  let education = 'BSc Computer Science'
  if (/phd/i.test(text)) education = 'PhD Computer Science'
  else if (/msc|master/i.test(text)) education = 'MSc Data Science'
  else if (/btech|bachelor|bsc/i.test(text)) education = 'BTech Information Technology'

  const commonSkills = [
    'Python', 'PyTorch', 'TensorFlow', 'React', 'TypeScript', 'Node.js', 'SQL',
    'Postgres', 'Docker', 'AWS', 'Kubernetes', 'NLP', 'Spark', 'C++', 'Java',
  ]

  const detectedSkills: string[] = []
  commonSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace('+', '\\+')}\\b`, 'i')
    if (regex.test(text)) {
      detectedSkills.push(skill)
    }
  })

  if (detectedSkills.length === 0) {
    detectedSkills.push('Python', 'SQL', 'Git')
  }

  // Extract contact info
  let email: string | undefined
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    email = emailMatch[0]
  }

  let phone: string | undefined
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/)
  if (phoneMatch) {
    phone = phoneMatch[0]
  }

  // Extract certifications if mentioned
  const certifications: string[] = []
  const certKeywords = ['AWS Certified', 'Azure Fundamentals', 'PMP', 'Scrum Master', 'TensorFlow Developer', 'GCP Associate Cloud Engineer', 'CKA', 'CISSP']
  certKeywords.forEach(cert => {
    if (new RegExp(`\\b${cert.replace('+', '\\+')}\\b`, 'i').test(text)) {
      certifications.push(cert)
    }
  })

  // Extract projects mentioned
  const projects: string[] = []
  const projMatches = text.match(/(?:project|developed|built|architected)\s*[:\-]?\s*([A-Za-z0-9\s-]{4,40})/gi)
  if (projMatches) {
    projMatches.slice(0, 3).forEach(m => {
      const cleaned = m.replace(/^(?:project|developed|built|architected)\s*[:\-]?\s*/i, '').trim()
      if (cleaned.length > 4) projects.push(cleaned)
    })
  }

  // Extract CGPA if present in text
  const parsedCGPA = extractCGPAFromText(text)

  const newId = `C-${1000 + existingCount + 1}`

  return {
    id: newId,
    name,
    initials,
    email,
    phone,
    education,
    experience: expYears,
    skills: detectedSkills,
    required: detectedSkills.slice(0, 3),
    projects: projects.length > 0 ? projects : [`${detectedSkills[0] || 'Software'} Architecture Project`],
    certifications: certifications.length > 0 ? certifications : undefined,
    location: 'Remote, IN',
    fairness: 'Clear',
    summary: text.slice(0, 140) + '...',
    status: 'Review',
    cgpa: parsedCGPA?.value,
    cgpaScale: parsedCGPA?.scale,
    source: 'Candidate Portal',
  }
}
