import { findMyPlaylist, insertPlaylist } from './playlists'
import { insertVideo } from './videos'
import { openPlaylister } from './ui'

global.doGet = openPlaylister
global.findMyPlaylist = findMyPlaylist
global.insertPlaylist = insertPlaylist
global.insertVideo = insertVideo
