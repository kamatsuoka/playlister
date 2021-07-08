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
    xhr.open(this.httpMethod, this.url, !0)
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
    let t = this.file.size
    if (this.chunkSize) {
      t = Math.min(this.offset + this.chunkSize, this.file.size)
    }
    e = e.slice(this.offset, t)
    const xhr = new XMLHttpRequest
    xhr.open('PUT', this.url, !0)
    xhr.setRequestHeader('Content-Type', this.contentType)
    xhr.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (t - 1) + '/' + this.file.size)
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type)
    xhr.upload && xhr.upload.addEventListener('progress', this.onProgress)
    xhr.onload = this.onContentUploadSuccess_.bind(this)
    xhr.onerror = this.onContentUploadError_.bind(this)
    xhr.send(e)
  }

  resume_() {
    const xhr = new XMLHttpRequest
    xhr.open('PUT', this.url, !0)
    xhr.setRequestHeader('Content-Range', 'bytes */' + this.file.size)
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type)
    xhr.upload && xhr.upload.addEventListener('progress', this.onProgress)
    xhr.onload = this.onContentUploadSuccess_.bind(this)
    xhr.onerror = this.onContentUploadError_.bind(this)
    xhr.send()
  }

  extractRange_(e) {
    const t = e.getResponseHeader('Range')
    t && (this.offset = parseInt(t.match(/\d+/g).pop(), 10) + 1)
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

let l, u, t, o, i

function p(e, t) {
  l.html(t || '')
  if (e) {
    $('button.reset').click()
    o.removeClass('disabled')
    u.hide()
  } else {
    o.addClass('disabled')
  }
}


class UploadWatcher {
  constructor() {
    this.videoId = ''
    this.uploadStartTime = 0
  }

  uploadFile(e, t) {
    let o = !1
    const n = {
      snippet: { title: s(), categoryId: 10 },
      status: { privacyStatus: 'private' },
    }
    const uploader = new ResumableUploader({
      baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
      file: e,
      token: t,
      metadata: n,
      params: { part: Object.keys(n).join(','), notifySubscribers: !1 },
      onError: e => {
        let t = e
        try {
          t = JSON.parse(e).error.message
        } finally {
          p(!0, t)
        }
      },
      onProgress: e => {
        const t = e.loaded, n = e.total, r = 100 * t / n
        $('#percent-transferred').text(r.toFixed(2))
        $('#bytes-transferred').text((t / 1048576).toFixed(3))
        $('#total-bytes').text((n / 1048576).toFixed(3))
        o || (o = !0, u.show())
        if (100 === r) {
          u.hide()
          l.html('Video uploaded, processing..')
          $('#terms').hide()
        }
      },
    })
    this.uploadStartTime = Date.now()
    uploader.upload()
  }
}


function run(e) {
  if (i.valid()) {
    return google.script.run.withSuccessHandler(e => {
      (new UploadWatcher).uploadFile($('#file').get(0).files[0], e)
    }).getToken()
  } else {
    return void window.setTimeout(function() {
      t.resetForm()
    }, 5e3)
  }
}

$(document).ready(function() {
  $.validator.setDefaults({ ignore: [] })
  $('select').formSelect()
  l = $('#message')
  u = $('#progress')
  o = $('#btnUpload')
  i = $('form')
  t = i.validate({
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
