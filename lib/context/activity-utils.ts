import type { Activity } from '../matching/types'

export const createActivityId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${Date.now()}-${crypto.randomUUID()}`
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function findDuplicateActivityIds(activities: Activity[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const activity of activities) {
    const id = String(activity.id)
    if (seen.has(id)) {
      duplicates.add(id)
    }
    seen.add(id)
  }
  return [...duplicates]
}

export const normalizeActivities = (activities: (Activity | any)[]): Activity[] => {
  const seen = new Set<string>()
  return activities.map(activity => {
    let id = String(activity.id)
    if (seen.has(id)) {
      id = createActivityId()
    }
    seen.add(id)
    return {
      ...activity,
      id,
    }
  })
}
