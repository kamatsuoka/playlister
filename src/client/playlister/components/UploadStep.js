import { Heading } from 'baseui/heading'
import Tooltip from './Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt'
import UploadList from './UploadList'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { createTheme, lightThemePrimitives, ThemeProvider } from 'baseui'
import { StyledLink } from 'baseui/link'
import { parseDescription } from '../models/dates'
import ActionButton from './ActionButton'
import { callServer } from '../api/api'
import PasswordContext from '../context/PasswordContext'
import { youtubeTitle } from '../models/renaming'

const UploadStep = ({ files, uploads, setUploads, allUploaded, showError }) => {
  // used to show status of checking for uploads
  const [checking, setChecking] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())
  const { password } = useContext(PasswordContext)

  const checkUploads = useCallback(() => {
    console.log('in checkUploads')
    const fileIds = files.map(data => data.fileId)
    if (fileIds.length === 0) {
      return
    }
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

    const fileMap = Object.fromEntries(
      files.map(file => [file.filename, {
        title: youtubeTitle(file.filename),
        fileData: { ...file, file: undefined } // can't send DOM File over wire
      }])
    )

    try {
      return callServer('findUploads', onSuccess, onFailure, ({ password, fileMap }))
    } catch (e) {
      onFailure(e)
    }
  }, [showError, files, setChecking, setUploads])

  useEffect(() => {
    if (!allUploaded) {
      return checkUploads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

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
        <ActionButton
          onClick={checkUploads} spin={checking} title='sync' icon={faSyncAlt}
          borderless disabled={files.length === 0} grayed={allUploaded}
        />
      </Heading>
      <UploadList
        files={files} checkedFileIds={checkedFileIds} uploads={uploads} setUploads={setUploads}
      />
    </>
  )
}

export default UploadStep
