import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTimes} from '@fortawesome/free-solid-svg-icons'


const details = (result) => {
  if (result.error) {
    return <td colSpan="3" className="result-error">{result.error}</td>
  } else {
    return <React.Fragment>
      <td>{result.format}</td>
      <td>{result.startTime}</td>
      <td>{result.duration}</td>
    </React.Fragment>
  }
}

const Result = ({id, result, onRemove}) => {
  return (
    <tr>
      <td>{result.name}</td>
      {details(result)}
      <td>
        <button
          className="remove"
          onClick={(event) => {
            event.stopPropagation()
            onRemove(id)
          }}
          tabIndex={0}
          title="Remove from list"
          type="button"
        >
          <FontAwesomeIcon icon={faTimes} size="lg"/>
        </button>
      </td>
    </tr>
  )
}

export default Result
