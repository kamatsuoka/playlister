import React from 'react'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import ActionButton from './ActionButton'

const PrevButton = ({ current, setCurrent, textual, ...props }) => {
  const { grayed = true, icon = faArrowLeft, ...otherProps } = props
  return (
    <ActionButton
      borderless
      icon={textual ? undefined : icon}
      text={textual ? 'prev' : undefined}
      onClick={() => setCurrent(current - 1)}
      title={props.title ? props.title : 'previous tab'}
      grayed={grayed}
      {...otherProps}
    />
  )
}

const NextButton = ({ current, setCurrent, textual, ...props }) => {
  const { grayed, onClick = undefined, icon = faArrowRight, ...otherProps } = props
  const defaultOnClick = () => setCurrent(current + 1)
  return (
    <ActionButton
      borderless
      icon={textual ? undefined : icon}
      text={textual ? 'next' : undefined}
      onClick={onClick || defaultOnClick}
      title={props.title ? props.title : 'next tab'}
      grayed={grayed}
      {...otherProps}
    />
  )
}

/**
 * Shows standard prev/next buttons for navigation
 */
const PrevNextButtons = ({ current, setCurrent, last, textual, align = 'right', prevProps = {}, nextProps = {} }) => {
  if (last) {
    nextProps.disabled = true
  }
  if (current === 0) {
    prevProps.disabled = true
  }
  return (
    <div align={align}>
      <PrevButton current={current} setCurrent={setCurrent} textual={textual} {...prevProps} />
    &nbsp;
      <NextButton current={current} setCurrent={setCurrent} textual={textual} {...nextProps} />
    </div>
  )
}

export default PrevNextButtons
