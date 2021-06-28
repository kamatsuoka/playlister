import React, {useCallback, useState} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faList} from '@fortawesome/free-solid-svg-icons'

import usePersist from '../hooks/usePersist'
import DropZone from './DropZone'
import Result from './Result'

// import MediaInfo from 'mediainfo.js'
// // using MediaInfo through npm/react didn't work,
// // so using it from CDN instead (see public/index.html)
const MediaInfo = window.MediaInfo

const readChunk = (file) => (chunkSize, offset) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target.error) {
        reject(event.target.error)
      }
      resolve(new Uint8Array(event.target.result))
    }
    reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
  })

const getRandomId = () => Math.random().toString(36).substr(2, 9)

const collapseAll = (restoredResults) =>
  Object.entries(restoredResults).reduce((acc, [key, val]) => {
    return {
      ...acc,
      [key]: {
        ...val,
        collapsed: true,
      },
    }
  }, {})

const MediaInfoJs = ({className}) => {
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState({})

  usePersist({
    key: 'results',
    onRestore: collapseAll,
    setState: setResults,
    state: results,
  })

  function filterResult(result) {
    const general = result.media.track.filter((track) => track["@type"] === "General")[0]
    return {
      duration: general.Duration,
      startTime: general.Encoded_Date
    }
  }

  /**
   * Gets file info for a single file.
   */
  function getFileInfo(mediainfo, file) {
    return mediainfo
      .analyzeData(() => file.size, readChunk(file))
      .then((result) => {
        setResults((prevResults) => ({
            [getRandomId()]: {
              ...(filterResult(result)),
              name: file.name,
              collapsed: false,
            },
            ...prevResults,
          }))
        }
      )
      .catch((error) =>
        setResults((prevResults) => ({
          [getRandomId()]: {collapsed: false, error: error.stack},
          ...prevResults,
        }))
      )
      .finally(() => setAnalyzing(false))
  }

  /**
   * Gets info for each file in list of files.
   * It's important to 'await' each call to getFileInfo,
   * otherwise the info returned is truncated.
   */
  async function onChangeFile(mediainfo, files) {
    for (const file of files) {
      if (file) {
        await getFileInfo(mediainfo, file)
      }
    }
  }

  /**
   * When file(s) dropped, get info for each of them
   */
  const onDrop = useCallback((files) => {
    if (files) {
      setAnalyzing(true)
      MediaInfo().then((mediainfo) =>
        onChangeFile(mediainfo, files)
      )
    }
  }, [])

  const onCollapse = useCallback(
    (resultId) =>
      setResults((prevResults) => ({
        ...prevResults,
        [resultId]: {
          ...prevResults[resultId],
          collapsed: !prevResults[resultId].collapsed,
        },
      })),
    []
  )

  const onRemove = useCallback(
    (resultId) => setResults(({[resultId]: _, ...rest}) => rest),
    []
  )

  const resultsContainer = Object.entries(results).map(([resultId, result]) => (
    <Result
      id={resultId}
      key={resultId}
      onCollapse={onCollapse}
      onRemove={onRemove}
      result={result}
    />
  ))

  return (
    <div className={className}>
      <DropZone analyzing={analyzing} onDrop={onDrop}/>
      <div id="results">
        <h2>
          <FontAwesomeIcon icon={faList}/> results
        </h2>
        {resultsContainer}
        {Object.keys(results).length ? null : 'No results yet…'}
      </div>
    </div>
  )
}
export default MediaInfoJs
