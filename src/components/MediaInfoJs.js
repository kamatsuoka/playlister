import React, {useCallback, useState} from 'react'

import {copyData, usePersist} from '../hooks/usePersist'
import DropZone from './DropZone'

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
const MediaInfoJs = ({results, setResults}) => {
  const [analyzing, setAnalyzing] = useState(false)

  usePersist({
    key: 'results',
    onRestore: copyData,
    setState: setResults,
    state: results,
  })

  function filterResult(result) {
    const general = result.media.track.filter(track => track["@type"] === "General")[0]
    return {
      format: general.Format,
      duration: general.Duration,
      startTime: general.Encoded_Date
    }
  }

  /**
   * When file(s) dropped, get info for each of them.
   */
  const onDrop = useCallback(files => {

    /**
     * Gets file info for a single file.
     */
    const getFileInfo = (mediainfo, file) => {
      return mediainfo
        .analyzeData(() => file.size, readChunk(file))
        .then(result => {
            setResults(prevResults => ({
              [getRandomId()]: {
                ...(filterResult(result)),
                name: file.name,
              },
              ...prevResults,
            }))
          }
        )
        .catch(error =>
          setResults(prevResults => ({
            [getRandomId()]: {
              name: file.name,
              error: error.stack
            },
            ...prevResults,
          }))
        )
        .finally(() => setAnalyzing(false))
    }

    if (files) {
      setAnalyzing(true)
      MediaInfo().then(async mediainfo => {
          for (const file of files) {
            if (file) {
              // need to 'await' each call to getFileInfo,
              // otherwise the info returned is truncated.
              await getFileInfo(mediainfo, file)
            }
          }
        }
      )
    }
  }, [setResults])

  return <DropZone analyzing={analyzing} onDrop={onDrop}/>
}
export default MediaInfoJs
