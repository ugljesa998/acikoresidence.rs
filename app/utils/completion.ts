import { project } from '~/data/project'

/** Planirani završetak gradnje po jeziku sajta: „Jun 2027“ (na početku) ili „jun 2027“ (usred rečenice). */
export function completionLabel(lang: string, capitalize = true) {
  const { year, month } = project.completion
  const name = new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(year, month - 1, 1))
  return `${capitalize ? name.charAt(0).toLocaleUpperCase(lang) + name.slice(1) : name} ${year}`
}
