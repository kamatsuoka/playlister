import React, { useState } from 'react'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import { Paragraph3 } from 'baseui/typography'
import { useStyletron } from 'baseui'
import * as auth from '../api/auth'
import ActionButton from './ActionButton'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'

const LoginPage = ({ current, setCurrent, password, setPassword }) => {
  const [, theme] = useStyletron()
  const [verifying, setVerifying] = useState(false)
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const checkPassword = () => {
    setVerifying(true)
    const onSuccess = ok => {
      setVerifying(false)
      if (ok) {
        return setCurrent(current + 1)
      } else {
        showError('incorrect password')
      }
    }
    const onFailure = e => {
      setVerifying(false)
      showError(e)
    }
    try {
      auth.checkPassword({ password, onSuccess, onFailure })
    } catch (e) {
      onFailure(e)
    }
  }

  return (
    <>
      <FlexGrid
        flexGridColumnCount={2}
        flexGridColumnGap='scale800'
        width={`calc(${theme.sizing.scale4800} * 4)`}
      >
        <FlexGridItem>
          <FormControl label='password'>
            <Input
              value={password || ''}
              onChange={e => setPassword(e.target.value)}
              type='password'
              error={!password}
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
      <Paragraph3>
        This is the application-specific password for playlister,
        not your Google password or any other password.
      </Paragraph3>
    </>
  )
}

export default LoginPage
