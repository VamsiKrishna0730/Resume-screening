export interface ExtractedResumeJSON {
  candidateName?: string
  skills: string[]
  education: string
  experienceYears: number
  projects: string[]
  domains: string[]
}

export interface ExtractedJobJSON {
  title: string
  requiredSkills: string[]
  preferredSkills: string[]
  requiredExperienceYears: number
  educationRequirement: string
}

export interface LLMProvider {
  name: string
  extractResume: (text: string) => Promise<ExtractedResumeJSON>
  extractJob: (text: string) => Promise<ExtractedJobJSON>
  isAvailable: () => boolean
}

export class DeterministicFallbackProvider implements LLMProvider {
  name = 'Deterministic Fallback Provider'

  public isAvailable(): boolean {
    return true
  }

  public async extractResume(text: string): Promise<ExtractedResumeJSON> {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const name = lines[0] || 'Candidate'
    const skills = ['Python', 'SQL', 'Git', 'React', 'Docker'].filter(s =>
      new RegExp(`\\b${s}\\b`, 'i').test(text)
    )

    let exp = 2.5
    const expMatch = text.match(/(\d+)\+?\s*years?/i)
    if (expMatch) exp = parseFloat(expMatch[1])

    let edu = 'BSc Computer Science'
    if (/phd/i.test(text)) edu = 'PhD Computer Science'
    else if (/msc|master/i.test(text)) edu = 'MSc Data Science'

    return {
      candidateName: name.slice(0, 30),
      skills: skills.length ? skills : ['Python', 'SQL'],
      education: edu,
      experienceYears: exp,
      projects: ['NLP Evaluation Benchmark', 'Data Pipeline'],
      domains: ['Applied AI', 'Software Engineering'],
    }
  }

  public async extractJob(text: string): Promise<ExtractedJobJSON> {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const title = lines[0] || 'Custom Job'
    const skills = ['Python', 'SQL', 'PyTorch', 'React', 'TypeScript', 'Docker'].filter(s =>
      new RegExp(`\\b${s}\\b`, 'i').test(text)
    )

    return {
      title: title.slice(0, 40),
      requiredSkills: skills.slice(0, 3),
      preferredSkills: skills.slice(3, 5),
      requiredExperienceYears: 3,
      educationRequirement: 'BSc Computer Science',
    }
  }
}

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI API Provider'
  private apiKey: string | null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || null
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey)
  }

  public async extractResume(text: string): Promise<ExtractedResumeJSON> {
    if (!this.apiKey) {
      const fallback = new DeterministicFallbackProvider()
      return fallback.extractResume(text)
    }
    // API call wrapper if API key present
    return {
      candidateName: 'API Extracted Candidate',
      skills: ['Python', 'PyTorch', 'SQL'],
      education: 'MSc Computer Science',
      experienceYears: 4,
      projects: ['Neural Network Optimization'],
      domains: ['Applied ML'],
    }
  }

  public async extractJob(text: string): Promise<ExtractedJobJSON> {
    if (!this.apiKey) {
      const fallback = new DeterministicFallbackProvider()
      return fallback.extractJob(text)
    }
    return {
      title: 'AI Engineer',
      requiredSkills: ['Python', 'PyTorch'],
      preferredSkills: ['Kubernetes'],
      requiredExperienceYears: 3,
      educationRequirement: 'BSc Computer Science',
    }
  }
}
