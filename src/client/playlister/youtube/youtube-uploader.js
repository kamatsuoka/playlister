class RetryHandler {
  constructor() {
    this.interval = 1e3
    this.maxInterval = 6e4
  }

  retry(e) {
    setTimeout(e, this.interval)
    this.interval = this.nextInterval_()
  }

  reset() {
    this.interval = 1e3
  }

  nextInterval_() {
    const e = 2 * this.interval + this.getRandomInt_(0, 1e3)
    return Math.min(e, this.maxInterval)
  }

  getRandomInt_(e, t) {
    return Math.floor(Math.random() * (t - e + 1) + e)
  }
}

class ResumableUploader {
  constructor({
                baseUrl,
                file,
                contentType,
                metadata,
                token,
                onComplete,
                onProgress,
                onError,
                offset = 0,
                chunkSize = 0,
                url,
                params,
                fileId,
              }) {
    Object.assign(this, { file, token, onComplete, onProgress, onError, offset, chunkSize, url })
    this.contentType = contentType || file.type || 'application/octet-stream'
    this.metadata = metadata || {
      title: file.name,
      mimeType: this.contentType,
    }
    this.retryHandler = new RetryHandler
    if (!this.url) {
      const o = params || {}
      o.uploadType = 'resumable'
      this.url = this.buildUrl_(fileId, o, baseUrl)
    }
    this.httpMethod = fileId ? 'PUT' : 'POST'
  }

  upload() {
    const xhr = new XMLHttpRequest
    xhr.open(this.httpMethod, this.url, true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.token)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('X-Upload-Content-Length', this.file.size)
    xhr.setRequestHeader('X-Upload-Content-Type', this.contentType)
    xhr.onload = function(e) {
      if (e.target.status < 400) {
        const t = e.target.getResponseHeader('Location')
        this.url = t, this.sendFile_()
      } else {
        this.onUploadError_(e)
      }
    }.bind(this)
    xhr.onerror = this.onUploadError_.bind(this)
    xhr.send(JSON.stringify(this.metadata))
  }

  sendFile_() {
    let e = this.file
    const size = this.chunkSize
      ? Math.min(this.offset + this.chunkSize, this.file.size)
      : this.file.size
    e = e.slice(this.offset, size)
    const xhr = new XMLHttpRequest
    xhr.open('PUT', this.url, true)
    xhr.setRequestHeader('Content-Type', this.contentType)
    xhr.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (size - 1) + '/' + this.file.size)
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type)
    xhr.upload && xhr.upload.addEventListener('progress', this.onProgress)
    xhr.onload = this.onContentUploadSuccess_.bind(this)
    xhr.onerror = this.onContentUploadError_.bind(this)
    xhr.send(e)
  }

  resume_() {
    const xhr = new XMLHttpRequest
    xhr.open('PUT', this.url, true)
    xhr.setRequestHeader('Content-Range', 'bytes */' + this.file.size)
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type)
    xhr.upload && xhr.upload.addEventListener('progress', this.onProgress)
    xhr.onload = this.onContentUploadSuccess_.bind(this)
    xhr.onerror = this.onContentUploadError_.bind(this)
    xhr.send()
  }

  extractRange_(e) {
    const range = e.getResponseHeader('Range')
    if (range) {
      this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1
    }
  }

  onContentUploadSuccess_(e) {
    if (200 === e.target.status || 201 === e.target.status) {
      this.onComplete && this.onComplete(e.target.response)
    } else {
      if (308 === e.target.status) {
        this.extractRange_(e.target), this.retryHandler.reset(), this.sendFile_()
      } else {
        this.onContentUploadError_(e)
      }
    }
  }

  onContentUploadError_(e) {
    if (e.target.status && e.target.status < 500) {
      this.onError(e.target.response)
    } else {
      this.retryHandler.retry(this.resume_.bind(this))
    }
  }

  onUploadError_(e) {
    this.onError(e.target.response)
  }

  buildQuery_(e) {
    return e = e || {}, Object.keys(e).map(function(t) {
      return encodeURIComponent(t) + '=' + encodeURIComponent(e[t])
    }).join('&')
  }

  buildUrl_(e, t, o) {
    let n = o
    e && (n += e)
    const r = this.buildQuery_(t)
    return r && (n += '?' + r), n
  }
}

function s() {
  return $('#video_title').val()
}

let message, progress, validator, uploadButton, form

function p(e, message) {
  message.html(message || '')
  if (e) {
    $('button.reset').click()
    uploadButton.removeClass('disabled')
    progress.hide()
  } else {
    uploadButton.addClass('disabled')
  }
}


class UploadWatcher {
  constructor() {
    this.videoId = ''
    this.uploadStartTime = 0
  }

  uploadFile(file, token) {
    let o = false
    const n = {
      snippet: { title: s(), categoryId: 10 },
      status: { privacyStatus: 'private' },
    }
    const uploader = new ResumableUploader({
      baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
      file: file,
      token: token,
      metadata: n,
      params: { part: Object.keys(n).join(','), notifySubscribers: false },
      onError: err => {
        let t = err
        try {
          t = JSON.parse(err).error.message
        } finally {
          p(true, t)
        }
      },
      onProgress: e => {
        const t = e.loaded, n = e.total, r = 100 * t / n
        $('#percent-transferred').text(r.toFixed(2))
        $('#bytes-transferred').text((t / 1048576).toFixed(3))
        $('#total-bytes').text((n / 1048576).toFixed(3))
        o || (o = true, progress.show())
        if (100 === r) {
          progress.hide()
          message.html('Video uploaded, processing..')
          $('#terms').hide()
        }
      },
      onComplete: _ => {
        message.html('Done')
      },
    })
    this.uploadStartTime = Date.now()
    uploader.upload()
  }
}


function run(e) {
  if (form.valid()) {
    return google.script.run.withSuccessHandler(token =>
      (new UploadWatcher).uploadFile($('#file').get(0).files[0], token),
    ).getToken()
  } else {
    return void window.setTimeout(function() {
      validator.resetForm()
    }, 5e3)
  }
}

$(document).ready(function() {
  $.validator.setDefaults({ ignore: [] })
  $('select').formSelect()
  message = $('#message')
  progress = $('#progress')
  uploadButton = $('#btnUpload')
  form = $('form')
  validator = form.validate({
    errorElement: 'div',
    errorPlacement: function(e, t) {
      const o = $(t).data('error')
      if (o) {
        $(o).append(e)
      } else {
        e.insertAfter(t)
      }
    },
  })
})
