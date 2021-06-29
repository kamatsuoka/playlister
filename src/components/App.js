import React, {useState} from 'react'
import {CSSTransition, SwitchTransition} from 'react-transition-group'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {BaseProvider, LightTheme} from 'baseui'
import {Provider as StyletronProvider} from "styletron-react"
import {Client as Styletron} from "styletron-engine-atomic"

import About from './About'
import MediaPage from './MediaPage'

const PAGE_FADE_TIME = 400
const engine = new Styletron()

function App() {

  const [page] = useState('mediapage')

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <section id="page">
          <SwitchTransition>
            <CSSTransition
              classNames="page"
              key={page}
              mountOnEnter
              timeout={PAGE_FADE_TIME}
            >
              {page === 'mediapage' ? <MediaPage/> : <About/>}
            </CSSTransition>
          </SwitchTransition>
        </section>
        <footer>
          <p>
            <a href="https://github.com/kamatsuoka/playlister">
              <FontAwesomeIcon className="fa-padded" icon={faGithub} size="lg"/>
              GitHub
            </a>
          </p>
        </footer>
      </BaseProvider>
    </StyletronProvider>
  )
}

export default App
