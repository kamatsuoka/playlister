import React from 'react'
import { FileUploader } from 'baseui/file-uploader'
import { LocaleProvider } from 'baseui'
// eslint-disable-next-line camelcase
import en_US from 'baseui/locale/en_US'

const DropZone = ({ analyzing, onDrop }) => {
  const locale = {
    // eslint-disable-next-line camelcase
    ...en_US,
    fileuploader: {
      ...en_US.fileuploader,
      dropFilesToUpload: 'Drop files here ...'
    }
  }
  return (
    <LocaleProvider locale={locale}>
      <FileUploader
        onDrop={onDrop}
        progressMessage={
          analyzing
            ? 'Analyzing ...'
            : ''
        }
      />
    </LocaleProvider>
  )
}

export default DropZone
