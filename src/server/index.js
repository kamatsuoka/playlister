import * as youtube from './youtube'
import { openPlaylister } from './ui'

global.getToken = () => {
  return ScriptApp.getOAuthToken()
}

global.doGet = openPlaylister

global.findMyPlaylist = youtube.findMyPlaylist
global.findUploads = youtube.findUploads
global.insertPlaylist = youtube.insertPlaylist
global.insertPlaylistItem = youtube.insertPlaylistItem
global.updateTitle = youtube.updateTitle
