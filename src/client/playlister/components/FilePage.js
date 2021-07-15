import MetadataReader from './MetadataReader'
import React, { useState } from 'react'
import MetadataList from './MetadataList'
import { BaseCard } from './BaseCard'
import UploadStatus from './UploadStatus'
import { KIND } from 'baseui/button'

/**
 * Page that holds files' MediaInfo data and rehearsal info
 */
const FilePage = ({ metadataList, setMetadataList, uploadStatus, setUploadStatus, current, prevButton, nextButton }) => {
  const [metadataErrors, setMetadataErrors] = useState([])
  const [allUploaded, setAllUploaded] = useState(false)

  return (
    <>
      <MetadataReader setMetadataList={setMetadataList} setMetadataErrors={setMetadataErrors}/>
      <BaseCard title='File Metadata'>
        <MetadataList metadataList={metadataList} setMetadataList={setMetadataList} metadataErrors={metadataErrors}/>
      </BaseCard>
      <BaseCard title='Upload Status'>
        <UploadStatus metadataList={metadataList} uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
          allUploaded={allUploaded} setAllUploaded={setAllUploaded}
        />
      </BaseCard>
      <div align='right'>
        {prevButton({current})}
        &nbsp;
        {nextButton({current, kind: allUploaded ? KIND.primary : KIND.secondary})}
      </div>
    </>
  )
}

export default FilePage
