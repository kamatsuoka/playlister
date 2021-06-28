import React, {useState} from 'react'
import {CSSTransition, SwitchTransition} from 'react-transition-group'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {faCopyright} from '@fortawesome/free-regular-svg-icons'

import About from './About'
import MediaInfoJs from './MediaInfoJs'

const PAGE_FADE_TIME = 400

function App() {

  const [page, setPage] = useState('mediainfojs')

  return (
    <>
      <section id="page">
        <SwitchTransition>
          <CSSTransition
            classNames="page"
            key={page}
            mountOnEnter
            timeout={PAGE_FADE_TIME}
          >
            {page === 'mediainfojs' ? <MediaInfoJs/> : <About/>}
          </CSSTransition>
        </SwitchTransition>
      </section>
      <footer>
        <p>
          <a href="https://github.com/kamatsuoka/playlister">
            <FontAwesomeIcon className="fa-padded" icon={faGithub} size="lg"/>
            GitHub
          </a>
          <span className="pull-right">
            <FontAwesomeIcon flip="horizontal" icon={faCopyright}/>{' '}
            <a href="https://github.com/kamatsuoka">kamatsuoka</a> 2021
          </span>
        </p>
      </footer>
    </>
  )
}

export default App
