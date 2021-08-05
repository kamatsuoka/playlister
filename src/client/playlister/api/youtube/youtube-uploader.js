import axios from 'axios'

const { youtubeTitle } = require('./youtube-client')

class RetryHandler {
  constructor () {
    this.interval = 1e3
    this.maxInterval = 6e4
  }

  retry (f) {
    setTimeout(f, this.interval)
    this.interval = this.nextInterval()
  }

  reset () {
    this.interval = 1e3
  }

  nextInterval () {
    const interval = 2 * this.interval + this.getRandomInt(1e3)
    return Math.min(interval, this.maxInterval)
  }

  getRandomInt (maxVal) {
    return Math.floor(Math.random() * (maxVal + 1))
  }
}

/**
 * Performs resumable videpo uploads to youtube.
 * See https://cloud.google.com/storage/docs/performing-resumable-uploads
 */
class ResumableUploader {
  constructor ({
    baseUrl,
    file,
    contentType,
    videoResource,
    token,
    onComplete,
    onProgress,
    onError,
    offset = 0,
    chunkSize = 0,
    params = {}
  }) {
    Object.assign(this, { file, videoResource, token, onComplete, onProgress, onError, offset, chunkSize })
    this.contentType = contentType || file.type || 'application/octet-stream'
    this.retryHandler = new RetryHandler()
    params.uploadType = 'resumable'
    this.url = this.buildUrl(baseUrl, params)
    this.onContentUploadSuccess = response => this.onComplete && this.onComplete(response)
    this.onContentUploadError = error => {
      if (error.response && error.response.status) {
        if (error.response.status === 308) { // google uses 308 to mean "Resume Incomplete"
          this.onResumeIncomplete(error.response)
        } else if (error.response.status < 500) {
          this.onUploadError(error.response)
        } else {
          this.retryHandler.retry(this.resume)
        }
      } else {
        this.onError(error.message)
      }
    }
    this.onUploadError = response => {
      console.log(`onUploadError: response data = ${response.data},` +
        ` status = ${response.status}, headers = ${response.headers}`)
      this.onError(response.data)
    }

    this.resume = () => {
      axios.put(this.url, {}, {
        headers: {
          'Content-Range': 'bytes */' + this.file.size,
          'X-Upload-Content-Type': this.file.type
        },
        onUploadProgress: this.onProgress
      })
        .then(this.onContentUploadSuccess)
        .catch(this.onContentUploadError)
    }
    this.sendFile = () => {
      const size = this.chunkSize
        ? Math.min(this.offset + this.chunkSize, this.file.size)
        : this.file.size
      const slice = this.file.slice(this.offset, size)
      axios.put(this.url, slice, {
        headers: {
          'Content-Type': this.contentType,
          'Content-Range': 'bytes ' + this.offset + '-' + (size - 1) + '/' + this.file.size,
          'X-Upload-Content-Type': this.file.type
        },
        onUploadProgress: this.onProgress
      })
        .then(this.onContentUploadSuccess)
        .catch(this.onContentUploadError)
    }
    this.onResumeIncomplete = response => {
      this.extractRange(response)
      this.retryHandler.reset()
      this.sendFile()
    }
    this.extractRange = response => {
      const range = response.headers.range
      if (range) {
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1
      }
    }
  }

  axios = window.axios

  upload () {
    axios.post(this.url, this.videoResource, {
      headers: {
        Authorization: 'Bearer ' + this.token,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': this.file.size,
        'X-Upload-Content-Type': this.contentType
      }
    }).then(response => {
      // would prefer creating a new object to mutating this object's variables
      this.url = response.headers.location
      this.sendFile()
    }).catch(error => {
      if (error.response) {
        this.onUploadError(error.response)
      } else if (error.message) {
        this.onError(error.message)
      }
    })
  }

  /**
   * Builds an url by adding query params to base url
   */
  buildUrl (baseUrl, params) {
    const url = new URL(baseUrl)
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
    return url.href
  }
}

/**
 * Uploads a file and watches for progress, completion, and error
 */
class UploadWatcher {
  /**
   * Constructs an upload watcher.
   *
   * @param progressHandler (percent: int) => ...
   * @param completeHandler ({id, title, ...}) => ...
   * @param errorHandler (error: str | { error: {message: str}}) => ...
   */
  constructor (progressHandler, completeHandler, errorHandler) {
    this.videoId = ''
    this.uploadStartTime = 0
    this.progressHandler = progressHandler
    this.completeHandler = completeHandler
    this.errorHandler = errorHandler
  }

  uploadFile (file, fileId, startTime, endTime, token) {
    const videoResource = {
      snippet: {
        title: youtubeTitle(file.name),
        description: JSON.stringify({ startTime, endTime, filename: file.name }),
        categoryId: 10
      },
      status: {
        privacyStatus: 'unlisted',
        selfDeclaredMadeForKids: false
      }
    }
    console.log(`uploading file with name ${file.name}, videoResource`, videoResource)
    const uploader = new ResumableUploader({
      baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
      file: file,
      token: token,
      videoResource: videoResource,
      params: {
        part: 'snippet,status,recordingDetails',
        notifySubscribers: false
      },
      onError: err => {
        let message = err
        try {
          message = JSON.parse(err).error.message
        } catch {
          // message was not JSON, ignore
        } finally {
          this.errorHandler(message)
        }
      },
      onProgress: progressEvent => {
        const percent = Math.round(100 * progressEvent.loaded / progressEvent.total)
        this.progressHandler(percent)
      },
      onComplete: response => {
        const video = response.data
        console.log('uploaded video, response = ', response)
        let startTime = ''
        let endTime = ''
        try {
          const parsed = JSON.parse(video.description)
          startTime = parsed.startTime
          endTime = parsed.endTime
        } catch {
          // ignore
        }
        this.completeHandler({
          videoId: video.id,
          filename: file.name,
          fileId: fileId,
          title: video.snippet.title,
          startTime: startTime,
          endTime: endTime,
          publishedAt: video.snippet.publishedAt,
          file: file
        })
      }
    })
    this.uploadStartTime = Date.now()
    uploader.upload()
  }
}

function resumableUpload (file, fileId, startTime, endTime, progressHandler, completeHandler, errorHandler) {
  return google.script.run.withSuccessHandler(token =>
    (new UploadWatcher(progressHandler, completeHandler, errorHandler))
      .uploadFile(file, fileId, startTime, endTime, token)
  ).getToken()
}

export default resumableUpload
