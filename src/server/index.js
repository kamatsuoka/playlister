import { findMyPlaylist } from './findMyPlaylist'
import { openPlaylister } from './ui'

global.doGet = openPlaylister
global.findMyPlaylist = findMyPlaylist
