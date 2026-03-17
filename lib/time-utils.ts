/**
 * Convert HH:MM format time string to today's timestamp
 * @param timeStr - Time in HH:MM format (e.g., "14:30")
 * @returns Unix timestamp in milliseconds
 */
export function timeStringToTimestamp(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
  return date.getTime()
}

/**
 * Convert timestamp to HH:MM format
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Time in HH:MM format
 */
export function timestampToTimeString(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Check if a number is a valid timestamp (rough check)
 */
export function isTimestamp(value: any): boolean {
  return typeof value === 'number' && value > 0 && value < Date.now() + 86400000 // Within 24 hours
}

/**
 * Check if a string is in HH:MM format
 */
export function isTimeString(value: any): boolean {
  return typeof value === 'string' && /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value)
}
