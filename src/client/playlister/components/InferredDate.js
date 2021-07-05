import React, { useEffect } from 'react'
import dayjs from 'dayjs'
import { BaseCard } from './BaseCard'

const inferredDate = (startEndList) => {
  const dateSet = new Set()
  startEndList.map(f => dayjs(f.startTime)
    .format('YYYYMMDD'))
    .forEach(d => dateSet.add(d))
  return dateSet.size > 0 ? dateSet.values().next().value : ''
}

const InferredDate = ({ startEndList, value, setValue }) => {

  useEffect(() => {
    setValue({...value, date: inferredDate(startEndList)})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startEndList])

  return (
    <BaseCard title="Inferred Date">
      <label>{value.date}</label>
    </BaseCard>
  )
}

export default InferredDate
