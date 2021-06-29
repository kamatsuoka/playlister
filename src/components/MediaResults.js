import React, {useCallback} from "react"
import Result from "./Result"

/**
 * List of MediaInfo results
 */
const MediaResults = ({results, setResults}) => {

  const onRemove = useCallback(
    (resultId) => setResults(({[resultId]: _, ...rest}) => rest),
    []
  )

  const resultsContainer = Object.entries(results).map(([resultId, result]) => (
    <Result
      id={resultId}
      key={resultId}
      onRemove={onRemove}
      result={result}
    />
  ))

  return (
    <div id="results">
      <table className="results-table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Format</th>
          <th>Start Time</th>
          <th>Duration</th>
          <th className="delete-button"/>
        </tr>
        </thead>
        <tbody>
        {resultsContainer}
        </tbody>
      </table>
      {Object.keys(results).length ? null : 'No results yet…'}
    </div>
  )
}

export default MediaResults
