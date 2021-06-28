import React, { useCallback, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faList } from '@fortawesome/free-solid-svg-icons'

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

const MediaInfoJs = ({ className }) => {
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState({})

  usePersist({
    key: 'results',
    onRestore: collapseAll,
    setState: setResults,
    state: results,
  })

  async function onChangeFile(mediainfo, files) {
    let file
    if (files.length >= 2) {
      for (let i = 0; i < files.length; i++) {
        file = files[i]
        if (file) {
          await get_file_info(mediainfo, file)
          if (i + 1 == files.length) {
            return
          }
        }
      }
    } else {
      file = files[0]
      if (file) {
        await get_file_info(mediainfo, file)
      }
    }
  }

  function get_file_info(mediainfo, file) {
    return mediainfo
      .analyzeData(() => file.size, readChunk(file))
      .then((result) =>
        setResults((prevResults) => ({
          [getRandomId()]: {
            ...result,
            name: file.name,
            collapsed: false,
          },
          ...prevResults,
        }))
      )
      .catch((error) =>
        setResults((prevResults) => ({
          [getRandomId()]: {collapsed: false, error: error.stack},
          ...prevResults,
        }))
      )
      .finally(() => setAnalyzing(false))
  }

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
    (resultId) => setResults(({ [resultId]: _, ...rest }) => rest),
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
      <DropZone analyzing={analyzing} onDrop={onDrop} />
      <div id="results">
        <h2>
          <FontAwesomeIcon icon={faList} /> results
        </h2>
        {resultsContainer}
        {Object.keys(results).length ? null : 'No results yet…'}
      </div>
    </div>
  )
}
export default MediaInfoJs
