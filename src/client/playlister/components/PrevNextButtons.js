import React from 'react'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import ActionButton from './ActionButton'

const PrevButton = ({ current, setCurrent, ...props }) => {
  if (current > 0) {
    return (
      <ActionButton
        borderless
        icon={faArrowLeft}
        onClick={() => setCurrent(current - 1)}
        title={props.title ? props.title : 'previous tab'}
        {...props}
      />
    )
  } else {
    return null
  }
}

const NextButton = ({ current, setCurrent, ...props }) => {
  const { onClick = undefined, ...otherProps } = props
  const defaultOnClick = () => setCurrent(current + 1)
  return (
    <ActionButton
      borderless
      icon={faArrowRight}
      onClick={onClick || defaultOnClick}
      title={props.title ? props.title : 'next tab'}
      {...otherProps}
    />
  )
}

/**
 * Shows standard prev/next buttons for navigation
 */
const prevNextButtons = ({ current, setCurrent, last, prevProps = {}, nextProps = {} }) => {
  return (
    <div align='right'>
      <PrevButton current={current} setCurrent={setCurrent} {...prevProps} />
    &nbsp;
      {last ? null : <NextButton current={current} setCurrent={setCurrent} {...nextProps} /> }
    </div>
  )
}

export default prevNextButtons
