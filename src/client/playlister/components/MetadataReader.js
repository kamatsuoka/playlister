import React, { useCallback, useState } from 'react'

import { LocaleProvider } from 'baseui'
import { FileUploader } from 'baseui/file-uploader'
// eslint-disable-next-line camelcase
import en_US from 'baseui/locale/en_US'

// import MediaInfo from 'mediainfo.js'
// // using MediaInfo through npm/react didn't work,
// // so using it from CDN instead (see public/index.html)
const MediaInfo = window.MediaInfo

const readChunk = file => (chunkSize, offset) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => {
      if (event.target.error) {
        reject(event.target.error)
      }
      resolve(new Uint8Array(event.target.result))
    }
    reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
  })

const getRandomId = () => Math.random().toString(36).substr(2, 9)

/**
 * Renders DropZone (and file picker) for one or more media files
 */
const MetadataReader = ({ setMetadataList, setMetadataErrors }) => {
  const [analyzing, setAnalyzing] = useState(false)

  function filterMetadata (data) {
    const general = data.media.track.filter(track => track['@type'] === 'General')[0]
    if (general.Format && general.Duration && general.Encoded_Date) {
      return {
        format: general.Format,
        duration: general.Duration,
        startTime: general.Encoded_Date
      }
    }
    throw 'No media detected'
  }

  /**
   * When file(s) dropped, get info for each of them.
   */
  const onDrop = useCallback(files => {
    /**
     * Gets metadata for a single file.
     */
    const getMetadata = (mediainfo, file) => {
      return mediainfo
        .analyzeData(() => file.size, readChunk(file))
        .then(data => {
          try {
            return ({
              ...filterMetadata(data),
              id: getRandomId(),
              name: file.name,
              file: file
            })
          } catch (e) {
            setMetadataErrors(errors => errors.concat({
              name: file.name,
              error: 'media not detected'
            }))
            return null
          }
        })
    }

    if (files) {
      setAnalyzing(true)
      MediaInfo().then(async mediainfo => {
        for (const file of files) {
          if (file) {
            const data = await getMetadata(mediainfo, file)
            if (data) {
              setMetadataList(metadataList =>
                metadataList
                  .concat([data])
                  .sort((d1, d2) => d1.name.toLowerCase() > d2.name.toLowerCase() ? 1 : -1))
            }
          }
        }
      }).finally(() => setAnalyzing(false))
    }
  }, [setMetadataList])

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
export default MetadataReader
