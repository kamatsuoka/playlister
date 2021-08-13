import React, { useContext, useState } from 'react'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import { Paragraph3 } from 'baseui/typography'
import { useStyletron } from 'baseui'
import ActionButton from './ActionButton'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import PasswordContext from '../context/PasswordContext'
import { callServer } from '../api/api'
import Tooltip from './Tooltip'

const LoginPage = ({ current, setCurrent }) => {
  const [, theme] = useStyletron()
  const [verifying, setVerifying] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)
  const { password, setPassword } = useContext(PasswordContext)

  const checkPassword = () => {
    setVerifying(true)
    const onSuccess = ok => {
      setVerifying(false)
      return setCurrent(current + 1)
    }
    const onFailure = e => {
      setVerifying(false)
      showError(e)
    }
    try {
      callServer('checkPassword', onSuccess, onFailure, password)
    } catch (e) {
      onFailure(e)
    }
  }

  const passwordTooltip = 'Enter the application-specific password for playlister, ' +
    'not your Google password or any other password'
  const passwordLabel = <Tooltip tooltip={passwordTooltip}>password</Tooltip>

  return (
    <>
      <FlexGrid
        flexGridColumnCount={2}
        flexGridColumnGap='scale800'
        width={`calc(${theme.sizing.scale4800} * 4)`}
      >
        <FlexGridItem>
          <FormControl label={passwordLabel}>
            <Input
              value={password || ''}
              onChange={e => setPassword(e.target.value)}
              type='password'
              onKeyUp={e => {
                if (e.which === 13) { checkPassword() }
              }}
            />
          </FormControl>
        </FlexGridItem>
        <FlexGridItem display='flex' style={{ alignItems: 'center', position: 'relative', top: theme.sizing.scale200 }}>
          <ActionButton icon={faSignInAlt} onClick={checkPassword} spin={verifying} disabled={!password} />
        </FlexGridItem>
      </FlexGrid>
      <Paragraph3 />
    </>
  )
}

export default LoginPage
