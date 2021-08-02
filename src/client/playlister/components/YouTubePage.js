import React, { useCallback, useEffect, useState } from 'react'
import { useSnackbar } from 'baseui/snackbar'
import { enqueueError, errorMessage } from '../util/enqueueError'
import { parseDescription } from '../util/dates'
import * as youtube from '../youtube/api'
import { findUploads } from '../youtube/api'
import UploadList from './UploadList'
import { Button, KIND } from 'baseui/button'
import prevNextButtons from './PrevNextButtons'
import PlaylistItems, { resourceToPlaylistItem } from './PlaylistItems'
import { ORIENTATION, Tab, Tabs } from 'baseui/tabs-motion'
import PlaylistCreate from './PlaylistCreate'
import PlaylistSelect from './PlaylistSelect'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import { createTheme, lightThemePrimitives, ThemeProvider, useStyletron } from 'baseui'
import { StyledLink } from 'baseui/link'
import Tooltip from './Tooltip'
import { Heading, HeadingLevel } from 'baseui/heading'
import { Block } from 'baseui/block'

export const YouTubePage = ({
  current, setCurrent,
  files, uploads, setUploads,
  orgInfo, cameraInfo, eventData,
  playlistTitle, setPlaylistTitle,
  playlists, setPlaylists,
  selectedPlaylist, setSelectedPlaylist,
  createdPlaylist, setCreatedPlaylist,
  playlist, setPlaylist,
  playlistItems, setPlaylistItems
}) => {
  /**
   * uploads items, keyed by file id:
   * - videoId
   * - title
   * - publishedAt
   * - fileId
   * - filename
   * - startTime
   * - endTime
   */
  const [css, theme] = useStyletron()
  // used to show status of checking for uploads
  const [checking, setChecking] = useState(false)
  // file ids that have been checked
  const [checkedFileIds, setCheckedFileIds] = useState(new Set())
  const { enqueue } = useSnackbar()
  const showError = enqueueError(enqueue)

  const [listing, setListing] = useState(false)

  /**
   * Sets the playlist and fetches its list of videos
   */
  const setAndListPlaylist = useCallback(playlist => {
    setPlaylist(playlist)
    const onSuccess = resources => {
      console.log('Got playlistItem resources from listPlaylistItems: ', resources)
      return setPlaylistItems(Object.fromEntries(
        resources
          .map(resourceToPlaylistItem)
          .sort((item1, item2) => item1.startTime > item2.startTime ? 1 : -1)
          .map(item => [item.videoId, item])
      ))
    }
    if (playlist.playlistId) {
      console.log('calling youtube.listPlaylistItems ...')
      youtube.listPlaylistItems(playlist.playlistId, onSuccess, showError)
    }
  }, [showError, setPlaylist, setPlaylistItems])

  console.log('playlistItems', playlistItems)

  /**
   * Gets playlist properties of interest from youtube Playlist resource
   *
   * https://developers.google.com/youtube/v3/docs/playlists#resource
   */
  const resourceToPlaylist = plist => ({
    playlistId: plist.id,
    title: plist.snippet.title,
    itemCount: plist.contentDetails.itemCount,
    publishedAt: plist.snippet.publishedAt,
    description: plist.snippet.description
  })

  /**
   * Failure handler for listing playlists
   */
  const playlistFailure = err => {
    setListing(false)
    showError(`Error listing playlists: ${errorMessage(err)}`)
  }

  /**
   * Find list of (hopefully recent) playlists
   */
  function listPlaylists () {
    setListing(true)
    const successHandler = resources => {
      setPlaylists(resources.map(resourceToPlaylist))
      setListing(false)
    }
    try {
      return youtube.listPlaylists(successHandler, playlistFailure)
    } catch (e) {
      playlistFailure(e)
    }
  }

  /*
  const playlistOkay = (playlistTitle.tabIndex === 0 && createdPlaylist.title) ||
    (playlistTitle.tabIndex === 1 && selectedPlaylist[0] && selectedPlaylist[0].title)
*/

  const tabOverrides = {
    TabPanel: {
      style: ({
        paddingTop: 0,
        paddingBottom: 0
      })
    }
  }

  const checkUploads = useCallback(() => {
    console.log('in checkUploads')
    const fileIds = files.map(data => data.fileId)
    setChecking(true)
    const onSuccess = foundUploads => {
      setUploads(Object.fromEntries(foundUploads.map(upload => [
        upload.fileData.fileId, {
          videoId: upload.videoId,
          title: upload.title,
          publishedAt: upload.publishedAt,
          ...upload.fileData,
          ...parseDescription(upload.description)
        }])))
      setCheckedFileIds(new Set(fileIds))
      setChecking(false)
    }
    const onFailure = err => {
      showError(err)
      setChecking(false)
    }

    try {
      return findUploads(files, onSuccess, onFailure)
    } catch (e) {
      onFailure(e)
    }
  }, [showError, files, setChecking, setUploads])

  useEffect(() => checkUploads(), [files])

  const uploadedFileIds = new Set(Object.keys(uploads).filter(fileId => uploads[fileId].videoId))

  const allUploaded = files.length > 0 && files.every(file => uploadedFileIds.has(file.fileId))

  const playlistVideoIds = new Set(Object.keys(playlistItems))

  const allAdded = Object.keys(playlist).length > 0 && allUploaded && files.every(file =>
    uploads[file.fileId] && playlistVideoIds.has(uploads[file.fileId].videoId)
  )

  const uploadTooltip = (
    <>
      You can upload your files here or on {' '}
      <ThemeProvider
        theme={createTheme(lightThemePrimitives, {
          colors: {
            linkText: '#ffffff',
            linkVisited: '#ffffff',
            linkHover: '#aaaaaa'
          }
        })}
      >
        <StyledLink href='https://www.youtube.com/upload' target='_blank' rel='noopener noreferrer'>
          YouTube
        </StyledLink>
      </ThemeProvider>
      <br />
      If you upload on YouTube, check for your uploads by clicking sync &nbsp;
      <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} size='sm' />
    </>
  )

  const getPlaylistStep = () => (
    <Block className={css({ marginBottom: theme.sizing.scale600 })}>
      <Heading styleLevel={5}>2. Choose Playlist</Heading>
      <Tabs
        activeKey={playlistTitle.tabIndex}
        orientation={ORIENTATION.vertical}
        onChange={({ activeKey }) => {
          setPlaylistTitle({ ...playlistTitle, tabIndex: parseInt(activeKey) })
          if (activeKey === '1' && playlists.length === 0) {
            return listPlaylists()
          }
          if (activeKey === '0' && Object.keys(createdPlaylist).length > 0) {
            setAndListPlaylist(createdPlaylist)
          } else if (activeKey === '1' && selectedPlaylist[0] && Object.keys(selectedPlaylist[0]).length > 0) {
            setAndListPlaylist(selectedPlaylist[0])
          }
        }}
      >
        <Tab title='New' overrides={tabOverrides}>
          <PlaylistCreate
            eventData={eventData} orgInfo={orgInfo} cameraInfo={cameraInfo}
            setCreatedPlaylist={setCreatedPlaylist} resourceToPlaylist={resourceToPlaylist}
            uploadedFileIds={uploadedFileIds} setPlaylist={setAndListPlaylist}
            playlistTitle={playlistTitle} setPlaylistTitle={setPlaylistTitle}
          />
        </Tab>
        <Tab title='Existing' overrides={tabOverrides}>
          <PlaylistSelect
            playlists={playlists}
            selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist}
            setPlaylist={setAndListPlaylist} listPlaylists={listPlaylists} listing={listing}
          />
        </Tab>
      </Tabs>
    </Block>
  )

  const getRenameStep = () =>
    <Block className={css({ marginBottom: theme.sizing.scale600 })}>
      <Heading styleLevel={5}>4. Rename</Heading>
    </Block>

  return (
    <HeadingLevel>
      <Heading styleLevel={5}>1. <Tooltip tooltip={uploadTooltip}>Upload</Tooltip>
        {' '}
        <Button
          title='sync'
          disabled={files.length === 0}
          kind={KIND.minimal}
          onClick={checkUploads}
        >
          <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} spin={checking} />
        </Button>
      </Heading>
      <UploadList
        files={files} checkedFileIds={checkedFileIds} uploads={uploads} setUploads={setUploads}
      />
      {allUploaded ? getPlaylistStep() : null}
      <PlaylistItems
        files={files} uploads={uploads} playlist={playlist}
        playlistItems={playlistItems} setPlaylistItems={setPlaylistItems}
      />
      {allAdded ? getRenameStep() : null}
      {prevNextButtons({
        current,
        setCurrent,
        nextProps: { kind: allUploaded ? KIND.primary : KIND.secondary }
      })}
    </HeadingLevel>
  )
}

export default YouTubePage
