import { findMyPlaylist, insertPlaylist } from './playlists'
import { openPlaylister } from './ui'

global.doGet = openPlaylister
global.findMyPlaylist = findMyPlaylist
global.insertPlaylist = insertPlaylist
