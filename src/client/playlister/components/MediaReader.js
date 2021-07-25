import React, { useCallback, useState } from 'react'

import { LocaleProvider } from 'baseui'
import { FileUploader } from 'baseui/file-uploader'
// eslint-disable-next-line camelcase
import en_US from 'baseui/locale/en_US'
import { useSnackbar } from 'baseui/snackbar'
import { showError } from '../util/showError'

// import MediaInfo from 'mediainfo.js'
// // using MediaInfo through npm/react didn't work,
// // so using it from CDN instead (see public/index.html)
const MediaInfo = window.MediaInfo

const getRandomId = () => Math.random().toString(36).substr(2, 9)

/**
 * Renders DropZone (and file picker) for one or more media files
 */
const MediaReader = ({ setMediaList }) => {
  /**
   * mediaList items:
   *
   * - format
   * - duration
   * - startTime
   * - fileId
   * - filename
   * - file
   */
  const [analyzing, setAnalyzing] = useState(false)

  const { enqueue } = useSnackbar()

  /**
   * Check if the mediainfo data contains a video
   * (has a track with @type = Video). If the General
   * track exists and has Format and Encoded_Date, return those
   * as well as duration.
   *
   * @return ({ format, duration, startTime })
   */
  function filterMedia (data) {
    const tracks = data.media.track
    if (tracks.some(track => track['@type'] === 'Video')) {
      const general = tracks.filter(track => track['@type'] === 'General')[0]
      if (general.Format && general.Duration && general.Encoded_Date) {
        return {
          format: general.Format,
          duration: general.Duration ? Math.round(general.Duration) : null,
          startTime: general.Encoded_Date
        }
      }
    }
    throw new Error('No media detected')
  }

  /**
   * When file(s) dropped, get info for each of them.
   */
  const onDrop = useCallback(files => {
    const readChunk = file => (chunkSize, offset) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = event => {
          if (event.target.error) {
            showError(enqueue, event.target.error)
            reject(event.target.error)
          }
          resolve(new Uint8Array(event.target.result))
        }
        reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
      })

    /**
     * Gets media info for a single file.
     */
    const getMedia = (mediainfo, file) => {
      return mediainfo
        .analyzeData(() => file.size, readChunk(file))
        .then(data => {
          console.log(`for file ${file.name}, got media data:`, data)
          try {
            return ({
              ...filterMedia(data),
              fileId: getRandomId(),
              filename: file.name,
              file: file
            })
          } catch (e) {
            showError(enqueue, `${file.name} — no video detected`)
          }
        }, err => showError(enqueue, err)
        )
    }

    if (files) {
      setAnalyzing(true)
      for (const file of files) {
        MediaInfo().then(async mediainfo => {
          if (file) {
            const data = await getMedia(mediainfo, file)
            if (data) {
              setMediaList(mediaList =>
                mediaList
                  .concat([data])
                  .sort((d1, d2) => d1.filename.toLowerCase() > d2.filename.toLowerCase() ? 1 : -1))
            }
          }
        })
      }
      setAnalyzing(false)
    }
  }, [enqueue, setMediaList])

  const locale = {
    // eslint-disable-next-line camelcase
    ...en_US,
    fileuploader: {
      ...en_US.fileuploader,
      dropFilesToUpload: (
        <div style={{ textAlign: 'center' }}>
          Drop video files here to extract their timestamps
        </div>
      )
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
        overrides={{
          Root: {
            style: ({ $theme }) => ({
              marginBottom: $theme.sizing.scale600
            })
          }
        }}
      />
    </LocaleProvider>
  )
}
export default MediaReader
