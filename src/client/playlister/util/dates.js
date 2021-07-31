import duration from 'dayjs/plugin/duration'
import dayjs from 'dayjs'

dayjs.extend(duration)

/**
 * Returns a pretty duration string for a given number of seconds,
 * e.g. 631 -> 10m31s
 */
export const durationSeconds = seconds =>
  prettyDuration(dayjs.duration(Math.round(parseFloat(seconds)), 'seconds'))

export const prettyDuration = duration => duration.toISOString().toLowerCase().replace(/^pt/, '')

const displayTemplate = 'YYYY-MM-DD HH:mm:ss z'

export const displayDate = date => dayjs(date).format(displayTemplate)

export const parseDescription = description => {
  try {
    const { startTime, endTime } = JSON.parse(description)
    return { startTime, endTime }
  } catch {
    return undefined
  }
}
