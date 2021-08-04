import { Button, KIND, SHAPE, SIZE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const width = '2px'
const style = 'solid'
const borderStyle = {
  borderTopWidth: width,
  borderTopStyle: style,
  borderRightWidth: width,
  borderRightStyle: style,
  borderBottomWidth: width,
  borderBottomStyle: style,
  borderLeftWidth: width,
  borderLeftStyle: style
}

const ActionButton = ({ onClick, title, borderless, disabled, icon, spin, pulse, grayed, ...props }) => {
  const buttonRootStyle = borderless ? {} : borderStyle
  const grayStyle = grayed ? { opacity: 0.3 } : {}
  return (
    <Button
      onClick={onClick}
      shape={SHAPE.circle}
      kind={KIND.minimal}
      size={SIZE.compact}
      overrides={{
        Root: {
          style: ({
            ...buttonRootStyle,
            ...grayStyle
          })
        }
      }}
      title={title}
      disabled={disabled}
      {...props}
    >
      {icon ? <FontAwesomeIcon icon={icon} size='lg' spin={spin} pulse={pulse} /> : ' '}
    </Button>
  )
}

export default ActionButton
