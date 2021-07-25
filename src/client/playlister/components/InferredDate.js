import dayjs from 'dayjs'

const inferDate = uploadList => {
  const dateSet = startTimeSet(uploadList)
  return dateSet.size > 0 ? dateSet.values().next().value : ''
}

/**
 * Extracts the set of start times from a list of objects
 * that have a startTime property
 *
 * @param startTimeHolders object that have startTime
 */
const startTimeSet = startTimeHolders => {
  const dateSet = new Set()
  startTimeHolders.map(f => dayjs(f.startTime)
    .format('YYYYMMDD'))
    .forEach(d => dateSet.add(d))
  return dateSet
}

/**
 * Gets the unique array of dates from an array of objects that
 * hold a startTime property.
 *
 * @param startTimeHolders objects that hold a startTime property
 * @returns Array of dates in YYYYMMDD format
 */
export function getStartDates (startTimeHolders) {
  return [...startTimeSet(startTimeHolders)]
}

export default inferDate
