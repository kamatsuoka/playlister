import { Button, KIND, SHAPE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const width = '2px'
const style = 'solid'
const buttonOverrides = {
  Root: {
    style: ({
      borderTopWidth: width,
      borderTopStyle: style,
      borderRightWidth: width,
      borderRightStyle: style,
      borderBottomWidth: width,
      borderBottomStyle: style,
      borderLeftWidth: width,
      borderLeftStyle: style
    })
  }
}

const ActionButton = ({ onClick, title, icon, spin, ...props }) =>
  <Button
    onClick={onClick}
    shape={SHAPE.circle}
    kind={KIND.minimal}
    overrides={buttonOverrides}
    title={title}
    {...props}
  >
    <FontAwesomeIcon icon={icon} size='lg' spin={spin} />
  </Button>

export default ActionButton
