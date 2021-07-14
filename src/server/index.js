import { findMyPlaylist, findUploads, insertPlaylist } from './youtube'
import { openPlaylister } from './ui'

function getToken() {
  return ScriptApp.getOAuthToken()
}

global.doGet = openPlaylister
global.findMyPlaylist = findMyPlaylist
global.findUploads = findUploads
global.insertPlaylist = insertPlaylist
global.getToken = getToken
