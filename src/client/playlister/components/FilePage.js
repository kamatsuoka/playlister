import MetadataReader from './MetadataReader'
import React, { useState } from 'react'
import { BaseCard } from './BaseCard'
import { KIND } from 'baseui/button'
import FileList from './FileList'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({ metadataList, setMetadataList, uploadStatus, setUploadStatus, current, prevButton, nextButton }) => {
  const [metadataErrors, setMetadataErrors] = useState([])
  const [allUploaded, setAllUploaded] = useState(false)

  return (
    <>
      <MetadataReader setMetadataList={setMetadataList} setMetadataErrors={setMetadataErrors} />
      <BaseCard title='Video Status'>
        <FileList
          metadataList={metadataList} setMetadataList={setMetadataList} metadataErrors={metadataErrors}
          uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
          setAllUploaded={setAllUploaded}
        />
      </BaseCard>
      <div align='right'>
        {prevButton({ current })}
        &nbsp;
        {nextButton({ current, kind: allUploaded ? KIND.primary : KIND.secondary })}
      </div>
    </>
  )
}

export default FilePage
