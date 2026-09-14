import { Job } from '../matching/types'

export function parseRawJobText(text: string, existingCount: number): Job {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const titleLine = lines[0] || `Custom Job #${existingCount + 1}`
  const title = titleLine.replace(/^title[:\s]*/i, '').slice(0, 40)

  let department = 'Engineering'
  if (/ai|ml|machine learning|research/i.test(text)) department = 'Applied AI'
  else if (/data|analytics/i.test(text)) department = 'Analytics'
  else if (/frontend|web|ui/i.test(text)) department = 'Product Engineering'

  const commonSkills = [
    'Python', 'PyTorch', 'TensorFlow', 'React', 'TypeScript', 'Node.js', 'SQL',
    'Postgres', 'Docker', 'AWS', 'Kubernetes', 'NLP', 'Spark', 'C++', 'Statistics',
  ]

  const requiredSkills: string[] = []
  commonSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace('+', '\\+')}\\b`, 'i')
    if (regex.test(text)) {
      requiredSkills.push(skill)
    }
  })

  if (requiredSkills.length === 0) {
    requiredSkills.push('Python', 'SQL')
  }

  const newId = `JOB-00${existingCount + 1}`

  return {
    id: newId,
    title,
    department,
    required: requiredSkills.slice(0, 4),
    preferred: requiredSkills.slice(4, 6),
    education: /phd/i.test(text) ? 'PhD' : /msc|master/i.test(text) ? 'MSc preferred' : 'BSc or equivalent',
    experience: /(\d+)\+?\s*years?/i.test(text) ? `${text.match(/(\d+)\+?\s*years?/i)![1]}+ years` : '3+ years',
    candidates: 12,
    description: text.slice(0, 160) + '...',
  }
}
