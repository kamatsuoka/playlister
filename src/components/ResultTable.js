import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFile,
  faFileAlt,
  faFileAudio,
  faFileVideo,
} from '@fortawesome/free-regular-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons'

const typeIconMap = {
  Audio: faFileAudio,
  Menu: faBars,
  Text: faFileAlt,
  Video: faFileVideo,
  default: faFile,
}

const getIcon = (type) =>
  typeIconMap[type] ? typeIconMap[type] : typeIconMap.default

const ResultTable = ({ result }) => {
  return (
    <table>
      <tbody>
      <tr>
        <td>{result.name}</td>
        <td>{result.startTime}</td>
        <td>{result.duration}</td>
      </tr>
      </tbody>
    </table>
  )
}

export default ResultTable
