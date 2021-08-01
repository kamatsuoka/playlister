import * as youtube from './youtube'
import { openPlaylister } from './ui'

function printStackTrace (e) {
  const stack = e.stack
    .split('\n')
    .slice(2)
    .map((line) => line.replace(/\s+at\s+/, ''))
    .join('\n')
  Logger.log(stack)
}

/**
 * Wrapper that invokes a function and print any stack trace that occurs
 *
 * @param f function to wrap
 * @return wrapped function
 */
const trace = f => (...args) => {
  try {
    return f(...args)
  } catch (e) {
    printStackTrace(e)
    throw e
  }
}

global.getToken = trace(() => { return ScriptApp.getOAuthToken() })
global.doGet = trace(openPlaylister)
global.findMyPlaylist = trace(youtube.findMyPlaylist)
global.listPlaylists = trace(youtube.listPlaylists)
global.findUploads = trace(youtube.findUploads)
global.insertPlaylist = trace(youtube.insertPlaylist)
global.insertPlaylistItem = trace(youtube.insertPlaylistItem)
global.updatePlaylistItem = trace(youtube.updatePlaylistItem)
global.listPlaylistItems = trace(youtube.listPlaylistItems)
global.addToPlaylist = trace(youtube.addToPlaylist)
global.updateTitle = trace(youtube.updateTitle)
