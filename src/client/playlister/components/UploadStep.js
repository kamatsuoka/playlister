import { Heading } from 'baseui/heading'
import Tooltip from './Tooltip'
import { Button, KIND } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import UploadList from './UploadList'
import React, { useCallback, useEffect, useState } from 'react'
import { createTheme, lightThemePrimitives, ThemeProvider } from 'baseui'
import { StyledLink } from 'baseui/link'
import { parseDescription } from '../util/dates'
import { findUploads } from '../youtube/api'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'

const UploadStep = ({ files, uploads, setUploads }) => {
  // used to show status of checking for uploads
  const [checking, setChecking] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const checkUploads = useCallback(() => {
    console.log('in checkUploads')
    const fileIds = files.map(data => data.fileId)
    setChecking(true)
    const onSuccess = foundUploads => {
      setUploads(Object.fromEntries(foundUploads.map(upload => [
        upload.fileData.fileId, {
          videoId: upload.videoId,
          title: upload.title,
          publishedAt: upload.publishedAt,
          ...upload.fileData,
          ...parseDescription(upload.description)
        }])))
      setCheckedFileIds(new Set(fileIds))
      setChecking(false)
    }
    const onFailure = err => {
      showError(err)
      setChecking(false)
    }

    try {
      return findUploads(files, onSuccess, onFailure)
    } catch (e) {
      onFailure(e)
    }
  }, [showError, files, setChecking, setUploads])

  useEffect(() => checkUploads(), [files])

  const uploadTooltip = (
    <>
      You can upload your files here or on {' '}
      <ThemeProvider
        theme={createTheme(lightThemePrimitives, {
          colors: {
            linkText: '#ffffff',
            linkVisited: '#ffffff',
            linkHover: '#aaaaaa'
          }
        })}
      >
        <StyledLink href='https://www.youtube.com/upload' target='_blank' rel='noopener noreferrer'>
          YouTube
        </StyledLink>
      </ThemeProvider>
      <br />
      If you upload on YouTube, check for your uploads by clicking sync &nbsp;
      <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} size='sm' />
    </>
  )

  return (
    <>
      <Heading styleLevel={5}>1. <Tooltip tooltip={uploadTooltip}>Upload</Tooltip>
        {' '}
        <Button
          title='sync'
          disabled={files.length === 0}
          kind={KIND.minimal}
          onClick={checkUploads}
        >
          <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} spin={checking} />
        </Button>
      </Heading>
      <UploadList
        files={files} checkedFileIds={checkedFileIds} uploads={uploads} setUploads={setUploads}
      />
    </>
  )
}

export default UploadStep
