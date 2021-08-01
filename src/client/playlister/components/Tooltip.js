import { StatefulTooltip } from 'baseui/tooltip'
import React from 'react'
import { useStyletron } from 'baseui'

/**
 * Shows underlined text with a tooltip
 */
const Tooltip = ({ tooltip, children }) => {
  const [css] = useStyletron()
  return (
    <StatefulTooltip accessibilityType='tooltip' content={tooltip} renderAll>
      <span className={css({ borderBottomWidth: '1px', borderBottomStyle: 'dotted' })}>
        {children}
      </span>
    </StatefulTooltip>
  )
}

export default Tooltip
