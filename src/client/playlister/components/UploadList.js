import React, { useState } from 'react'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import { tableOverrides } from './TableOverrides'
import { Button, KIND, SIZE } from 'baseui/button'
import resumableUpload from '../youtube/youtube-uploader'
import { displayDate } from '../util/dates'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError } from '../util/enqueueError'
import Tooltip from './Tooltip'
import { StyledLink } from 'baseui/link'
import { createTheme, lightThemePrimitives, ThemeProvider } from 'baseui'

const UPLOADING = 'uploading'
const ERROR = 'error'

/**
 * List of file upload status
 */
const UploadList = ({ files, checkedFileIds, uploads, setUploads, checking, checkUploads }) => {
  // map of fileId to upload button state
  const [uploadButtonState, setUploadButtonState] = useState({})
  // map of fileId to upload progress
  const [uploadProgress, setUploadProgress] = useState({})
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const uploadFile = (file, fileId, startTime, endTime) => {
    const progressHandler = percent => {
      setUploadProgress({ ...uploadProgress, [fileId]: percent })
    }
    const errorHandler = error => {
      setUploadButtonState({ ...uploadButtonState, [fileId]: ERROR })
      showError(error)
    }
    const completeHandler = uploaded => {
      console.log('completeHandler: uploaded = ', uploaded)
      return setUploads(uploads => ({ ...uploads, [fileId]: uploaded }))
    }
    resumableUpload(file, fileId, startTime, endTime, progressHandler, completeHandler, errorHandler)
  }

  const getButtonContent = fileId => {
    if (!uploadButtonState[fileId]) {
      return '⇧ upload'
    }
    if (uploadButtonState[fileId] === UPLOADING) {
      return ' '
    }
    if (uploadButtonState[fileId] === ERROR) {
      return 'upload error'
    }
  }

  /**
   * Renders:
   * - the published-at date if the file has been uploaded
   * - an upload button if the file's upload status has been checked but it hasn't been uploaded
   * - a spinner if the upload button has been clicked but no progress event has been received
   * - a progress percent if the file is being uploaded and a progress event was received
   *
   * @param row
   * @returns {JSX.Element|string}
   */
  const uploadButton = row => {
    if (uploads[row.fileId] && uploads[row.fileId].publishedAt) {
      return displayDate(uploads[row.fileId].publishedAt)
    }
    if (uploadProgress[row.fileId]) {
      return `${uploadProgress[row.fileId]}%`
    }
    const checked = checkedFileIds.has(row.fileId)
    if (checked) {
      return (
        <Button
          onClick={() => {
            setUploadButtonState({ ...uploadButtonState, [row.fileId]: UPLOADING })
            uploadFile(row.file, row.fileId, row.startTime, row.endTime)
          }}
          title='Upload'
          kind={KIND.tertiary}
          size={SIZE.mini}
          isLoading={uploadButtonState[row.fileId] === UPLOADING}
        >
          {getButtonContent(row.fileId)}
        </Button>
      )
    } else {
      return <FontAwesomeIcon icon={faQuestion} size='sm' title='Check status' />
    }
  }

  const tableCellStyles = $theme => ({
    verticalAlign: 'center',
    paddingLeft: $theme.sizing.scale200,
    paddingRight: $theme.sizing.scale200,
    paddingTop: $theme.sizing.scale400,
    paddingBottom: $theme.sizing.scale400
  })

  const columnOverrides = {
    TableBodyCell: {
      style: ({ $theme }) => {
        return tableCellStyles($theme)
      }
    }
  }

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

  const uploadDateHeader = (
    <>
      <Tooltip tooltip={uploadTooltip}>
        Upload Date
      </Tooltip>
      {' '}
      <Button
        size={SIZE.small} disabled={files.length === 0}
        kind={KIND.minimal}
        onClick={checkUploads}
        overrides={{
          Root: {
            style: ({ $theme }) => ({
              paddingTop: 0,
              paddingBottom: 0,
              position: 'relative',
              top: '3px'
            })
          }
        }}
      >
        <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} spin={checking} />
      </Button>
    </>
  )

  return (
    <div>
      <TableBuilder data={files} overrides={tableOverrides}>
        <TableBuilderColumn overrides={columnOverrides} header='Filename'>
          {row => row.filename}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='Start Time'>
          {row => displayDate(row.startTime)}
        </TableBuilderColumn>
        <TableBuilderColumn header={uploadDateHeader} overrides={columnOverrides}>
          {row => uploadButton(row)}
        </TableBuilderColumn>
        <TableBuilderColumn overrides={columnOverrides} header='YouTube Title'>
          {row => uploads[row.fileId] ? uploads[row.fileId].title : null}
        </TableBuilderColumn>
      </TableBuilder>
    </div>
  )
}

export default UploadList
