import dayjs from 'dayjs'

const inferDate = (startEndList) => {
  const dateSet = new Set()
  startEndList.map(f => dayjs(f.startTime)
    .format('YYYYMMDD'))
    .forEach(d => dateSet.add(d))
  return dateSet.size > 0 ? dateSet.values().next().value : ''
}

export default inferDate
