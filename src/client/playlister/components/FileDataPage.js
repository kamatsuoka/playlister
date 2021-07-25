import React, { useState } from 'react'
import FileDataList from './FileDataList'
import MediaReader from './MediaReader'
import { Modal } from 'baseui/modal'
import TimeOffset from './TimeOffset'

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const FileDataPage = ({
  mediaList, setMediaList,
  fileDataList, setFileDataList,
  timeAdjust, setTimeAdjust, prevNextButtons,
  eventData, setEventData
}) => {
  /**
   * fileDataList items:
   * - fileId
   * - name
   * - startTime
   * - duration
   * - endTime
   * - file
   */
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)
  const [previewUrl, setPreviewUrl] = React.useState(null)
  function closePreview () {
    if (previewUrl != null) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }

  /**
   * Shows a video centered on the screen. Use a transparent Modal to
   * provide standard close behavior (click outside or press escape).
   */
  const videoPreview = () => (
    <Modal
      onClose={closePreview}
      isOpen={previewUrl != null}
      overrides={{
        Dialog: { style: { backgroundColor: 'transparent' } },
        Close: { style: ({ display: 'none' }) }
      }}
    >
      <video
        autoPlay controls style={{
          maxWidth: '80vh',
          maxHeight: '80vh',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <source src={previewUrl} />
      </video>
    </Modal>
  )

  function filesAndOffset () {
    return (
      <>
        <FileDataList
          mediaList={mediaList} setMediaList={setMediaList}
          overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          fileDataList={fileDataList} setFileDataList={setFileDataList}
          setPreviewUrl={setPreviewUrl}
        />
        <TimeOffset
          mediaList={mediaList} timeAdjust={timeAdjust} setTimeAdjust={setTimeAdjust}
          overrideTimeZone={overrideTimeZone} setOverrideTimeZone={setOverrideTimeZone}
        />
      </>
    )
  }

  return (
    <>
      <MediaReader setMediaList={setMediaList} />
      {videoPreview()}
      {mediaList.length > 0 ? filesAndOffset() : null}
      {prevNextButtons({ current: 1 })}
    </>
  )
}

export default FileDataPage
