import React, { useState } from 'react'
import ActionButton from './ActionButton'
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'

const TestPage = () => {
  const [clicked, setClicked] = useState(false)
  return (
    <>
      <ActionButton
        onClick={() => { setClicked(clicked => !clicked) }}
        spin={false} title='test' icon={faAngleDoubleRight}
        pulse={clicked}
      />
    </>
  )
}

export default TestPage
