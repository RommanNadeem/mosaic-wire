/**
 * Capitalize first letter of a string
 */
export function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

