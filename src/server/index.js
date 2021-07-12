import { findMyPlaylist, insertPlaylist, findRecentVideos } from './youtube'
import { insertVideo } from './videos'
import { openPlaylister } from './ui'

global.doGet = openPlaylister
global.findMyPlaylist = findMyPlaylist
global.findRecentVideos = findRecentVideos
global.insertPlaylist = insertPlaylist
global.insertVideo = insertVideo
