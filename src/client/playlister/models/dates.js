import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.extend(localizedFormat)
dayjs.extend(timezone)
dayjs.extend(utc)

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

export const DEFAULT_DATE = 'default_date'
export const CUSTOM_DATE = 'custom_date'

/**
 * Gets event date based on choice of default or custom
 */
export const getChosenDate = eventData =>
  eventData.dateChoice === DEFAULT_DATE ? eventData.defaultDate : eventData.customDate

export const localDate = date => displayDate(date).replace(/ [A-Z]{3}$/, '')

const metadataTemplate = 'M/D/YYYY'

export const metadataDate = date => dayjs(date).format(metadataTemplate)
