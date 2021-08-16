import { Button, KIND, SHAPE, SIZE } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Label2 } from 'baseui/typography'
import { useStyletron } from 'baseui'

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

const ActionButton = ({ onClick, title, borderless, disabled, text, icon, spin, pulse, grayed, ...props }) => {
  const [css, theme] = useStyletron()
  const buttonRootStyle = borderless ? {} : borderStyle
  const grayStyle = grayed || disabled ? { opacity: 0.3 } : {}
  const labelClass = text && icon ? css({ marginRight: theme.sizing.scale400 }) : {}
  const isSelected = !grayed
  return (
    <Button
      onClick={onClick}
      shape={text ? SHAPE.pill : SHAPE.circle}
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
      disabled={disabled || spin}
      isSelected={isSelected}
      {...props}
    >
      <Label2 className={labelClass}>{text}</Label2>
      {icon ? <FontAwesomeIcon icon={icon} size='lg' spin={spin} pulse={pulse} /> : ' '}
    </Button>
  )
}

export default ActionButton
