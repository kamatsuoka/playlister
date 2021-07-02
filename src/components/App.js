import React, {useState} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {BaseProvider, LightTheme} from 'baseui'
import {Provider as StyletronProvider} from "styletron-react"
import {Client as Styletron} from "styletron-engine-atomic"
import {Tab, Tabs} from 'baseui/tabs-motion';

import MediaPage from './MediaPage'
import YouTube from "./YouTube"
import GoogleAuth from "./GoogleAuth"

const engine = new Styletron()

function App() {

  const [activeKey, setActiveKey] = useState(0);
  const [startEndList, setStartEndList] = useState([])
  const [googleAuth, setGoogleAuth] = useState()

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <Tabs
          activeKey={activeKey}
          onChange={({activeKey}) => setActiveKey(activeKey)}
        >
          <Tab title="Media">
            <MediaPage startEndList={startEndList} setStartEndList={setStartEndList}/>
          </Tab>
          <Tab title="Google Auth">
            <GoogleAuth googleAuth={googleAuth} setGoogleAuth={setGoogleAuth}/>
          </Tab>
          <Tab title="YouTube">
            <YouTube googleAuth={googleAuth} startEndList={startEndList}/>
          </Tab>
        </Tabs>
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
