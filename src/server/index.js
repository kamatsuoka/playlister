import * as youtube from './youtube-server'
import * as sheets from './sheets-server'
import * as auth from './auth-server'
import { withAuth } from './auth-server'
import { openPlaylister } from './ui'

global.doGet = openPlaylister

global.checkPassword = auth.checkPassword
global.getToken = withAuth(() => ScriptApp.getOAuthToken())
global.findPlaylist = withAuth(youtube.findPlaylist)
global.listPlaylists = withAuth(youtube.listPlaylists)
global.findUploads = withAuth(youtube.findUploads)
global.insertPlaylist = withAuth(youtube.insertPlaylist)
global.listPlaylistItems = withAuth(youtube.listPlaylistItems)
global.addToPlaylist = withAuth(youtube.addToPlaylist)
global.renameVideos = withAuth(youtube.renameVideos)
global.appendRows = withAuth(sheets.appendRows)
global.tailSheet = withAuth(sheets.tailSheet)
