import React, { useEffect, useState } from 'react'
import FileList from './FileList'
import MediaReader from './MediaReader'
import { Modal } from 'baseui/modal'
import TimeOffset from './TimeOffset'
import { getStartDates } from './InferredDate'
import { KIND as NKind, Notification } from 'baseui/notification'
import PrevNextButtons from './PrevNextButtons'
import { Heading } from 'baseui/heading'

/**
 * Adjust time on file metadata in case camera doesn't have time zone
 * or has time set incorrectly
 */
const FilePage = ({
  current, setCurrent,
  mediaList, setMediaList,
  files, setFiles,
  timeAdjust, setTimeAdjust,
  eventData, setEventData
}) => {
  /**
   * files items:
   * - fileId
   * - name
   * - startTime
   * - duration
   * - endTime
   * - file
   */
  const [overrideTimeZone, setOverrideTimeZone] = useState(true)
  const [useTimeCode, setUseTimeCode] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const startDates = getStartDates(files)
  const defaultDate = startDates[0]
  useEffect(() => {
    setEventData(({ ...eventData, defaultDate: defaultDate }))
  }, [defaultDate])

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
      unstable_ModalBackdropScroll
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
        <FileList
          mediaList={mediaList} setMediaList={setMediaList}
          overrideTimeZone={overrideTimeZone} timeAdjust={timeAdjust}
          useTimeCode={useTimeCode}
          files={files} setFiles={setFiles}
          setPreviewUrl={setPreviewUrl} eventData={eventData} setEventData={setEventData}
        />
        <TimeOffset
          mediaList={mediaList} startDates={startDates}
          timeAdjust={timeAdjust} setTimeAdjust={setTimeAdjust}
          overrideTimeZone={overrideTimeZone} setOverrideTimeZone={setOverrideTimeZone}
          useTimeCode={useTimeCode} setUseTimeCode={setUseTimeCode}
          eventData={eventData} setEventData={setEventData}
        />
        {startDates.length > 1
          ? <Notification kind={NKind.negative}>Multiple dates found in start times</Notification>
          : null}
      </>
    )
  }

  return (
    <>
      <Heading styleLevel={5}>Extract Video Timestamps</Heading>
      <MediaReader setMediaList={setMediaList} />
      {videoPreview()}
      {mediaList.length > 0 ? filesAndOffset() : null}
      <PrevNextButtons
        current={current}
        setCurrent={setCurrent}
        nextProps={{
          grayed: mediaList.length === 0
        }}
      />
    </>
  )
}

export default FilePage
