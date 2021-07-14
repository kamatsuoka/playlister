import MetadataReader from './MetadataReader'
import React, { useState } from 'react'
import MetadataList from './MetadataList'
import { BaseCard } from './BaseCard'
import UploadStatus from './UploadStatus'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({ metadataList, setMetadataList, uploadStatus, setUploadStatus, current, prevButton, nextButton }) => {
  const [metadataErrors, setMetadataErrors] = useState([])

  return (
    <>
      <MetadataReader setMetadataList={setMetadataList} setMetadataErrors={setMetadataErrors}/>
      <BaseCard title='File Metadata'>
        <MetadataList metadataList={metadataList} setMetadataList={setMetadataList} metadataErrors={metadataErrors}/>
      </BaseCard>
      <BaseCard title='Upload Status'>
        <UploadStatus metadataList={metadataList} uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}/>
      </BaseCard>
      <div align='right'>
        {prevButton(current)}
        &nbsp;
        {nextButton(current)}
      </div>
    </>
  )
}

export default FilePage
