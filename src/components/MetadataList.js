import React, {useCallback} from "react"
import Result from "./Result"

/**
 * List of file info from MediaInfo
 */
const MetadataList = ({values, setValues}) => {

  const onRemove = useCallback(
    (resultId) => setValues(({[resultId]: _, ...rest}) => rest),
    [setValues]
  )

  const resultsContainer = Object.entries(values).map(([resultId, result]) => (
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
    </div>
  )
}

export default MetadataList
