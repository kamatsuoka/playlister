import React from 'react'
import { Button } from 'baseui/button'

const prevButton = (current, setCurrent, props) => {
  if (current > 0) {
    return (
      <Button
        size='compact' {...props}
        onClick={() => setCurrent(current - 1)}
      >Prev
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
        size='compact' {...otherProps}
        onClick={onClick || defaultOnClick}
      >Next
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
