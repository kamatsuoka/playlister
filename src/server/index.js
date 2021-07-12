import { findMyPlaylist, findUploads, insertPlaylist } from './youtube'
import { insertVideo } from './videos'
import { openPlaylister } from './ui'

global.doGet = openPlaylister
global.findMyPlaylist = findMyPlaylist
global.findUploads = findUploads
global.insertPlaylist = insertPlaylist
global.insertVideo = insertVideo
