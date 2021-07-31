import React from 'react'
import { Button, KIND, SHAPE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const prevButton = (current, setCurrent, props) => {
  if (current > 0) {
    return (
      <Button
        {...props}
        shape={SHAPE.round}
        kind={KIND.minimal}
        onClick={() => setCurrent(current - 1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} size='lg' />
      </Button>
    )
  } else { return null }
}

const nextButton = (current, setCurrent, props) => {
  const { last = false, onClick = undefined, ...otherProps } = props
  const defaultOnClick = () => setCurrent(current + 1)
  if (last) {
    return null
  } else {
    return (
      <Button
        {...otherProps}
        shape={SHAPE.round}
        kind={KIND.minimal}
        onClick={onClick || defaultOnClick}
      >
        <FontAwesomeIcon icon={faArrowRight} size='lg' />
      </Button>
    )
  }
}

/**
 * Shows standard prev/next buttons for navigation
 */
const prevNextButtons = ({ current, setCurrent, prevProps = {}, nextProps = {} }) => {
  return (
    <div align='right'>
      {prevButton(current, setCurrent, prevProps)}
    &nbsp;
      {nextButton(current, setCurrent, nextProps)}
    </div>
  )
}

export default prevNextButtons
