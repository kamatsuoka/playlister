import * as youtube from './youtube-server'
import * as sheets from './sheets-server'
import * as auth from './auth-server'
import { openPlaylister } from './ui'

global.checkPassword = auth.checkPassword
global.getToken = () => { return ScriptApp.getOAuthToken() }
global.doGet = openPlaylister
global.findMyPlaylist = youtube.findMyPlaylist
global.listPlaylists = youtube.listPlaylists
global.findUploads = youtube.findUploads
global.insertPlaylist = youtube.insertPlaylist
global.insertPlaylistItem = youtube.insertPlaylistItem
global.updatePlaylistItem = youtube.updatePlaylistItem
global.listPlaylistItems = youtube.listPlaylistItems
global.addToPlaylist = youtube.addToPlaylist
global.renameVideos = youtube.renameVideos
global.appendRows = sheets.appendRows
global.tailSheet = sheets.tailSheet
