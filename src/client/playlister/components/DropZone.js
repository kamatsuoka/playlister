import React from 'react'
import { FileUploader } from 'baseui/file-uploader'

const DropZone = ({ analyzing, onDrop }) => {
  return (
    <FileUploader
      onDrop={onDrop}
      progressMessage={
        analyzing
          ? 'Analyzing ...'
          : ''
      }
    />
  )
}

export default DropZone
