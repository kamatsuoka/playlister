import {ALIGN, Radio, RadioGroup} from "baseui/radio"
import React, {useEffect} from "react"
import {Input} from "baseui/input"
import {BaseCard} from "./BaseCard"

const PlaylistTitle = ({inferredDate, rehearsalData, value, setValue}) => {

  useEffect(() => {
    setValue({
      ...value,
      suggestedTitle: `${inferredDate.date} ${rehearsalData.eventType}`
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rehearsalData])

  return (
    <BaseCard title="Playlist Title">
      <RadioGroup
        value={value.titleChoice}
        onChange={e => setValue({...value, titleChoice: e.currentTarget.value})}
        name="titleChoice"
        align={ALIGN.horizontal}
      >
        <Radio value="suggested">Suggested &nbsp;</Radio>
        <Radio value="custom">Custom</Radio>
      </RadioGroup>
      <Input
        value={value.titleChoice === 'suggested' ? (value.suggestedTitle || '') : value.customTitle || ''}
        onChange={e => {
          if (value.titleChoice === 'custom')
            return setValue({...value, customTitle: e.target.value})
          else
            return null
        }}
        disabled={value.titleChoice !== 'custom'}
      />
    </BaseCard>
  )
}
export default PlaylistTitle
