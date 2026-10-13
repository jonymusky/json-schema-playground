/** `<input type="time">` may omit seconds; JSON Schema `time` expects HH:MM:SS. */
export const normalizeTime = (value: string) => (/^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value)

/** `<input type="datetime-local">` value → RFC 3339 `date-time` (UTC). */
export const localToIso = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

/** RFC 3339 `date-time` → value for `<input type="datetime-local">`. */
export const isoToLocal = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
