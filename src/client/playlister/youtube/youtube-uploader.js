class n {
  constructor() {
    this.interval = 1e3, this.maxInterval = 6e4
  }

  retry(e) {
    setTimeout(e, this.interval), this.interval = this.nextInterval_()
  }

  reset() {
    this.interval = 1e3
  }

  nextInterval_() {
    var e = 2 * this.interval + this.getRandomInt_(0, 1e3)
    return Math.min(e, this.maxInterval)
  }

  getRandomInt_(e, t) {
    return Math.floor(Math.random() * (t - e + 1) + e)
  }
}

class r {
  constructor(e) {
    var t = function() {
    }
    if (this.file = e.file, this.contentType = e.contentType || this.file.type || 'application/octet-stream', this.metadata = e.metadata || {
      title: this.file.name,
      mimeType: this.contentType,
    }, this.token = e.token, this.onComplete = e.onComplete || t, this.onProgress = e.onProgress || t, this.onError = e.onError || t, this.offset = e.offset || 0, this.chunkSize = e.chunkSize || 0, this.retryHandler = new n, this.url = e.url, !this.url) {
      var o = e.params || {}
      o.uploadType = 'resumable', this.url = this.buildUrl_(e.fileId, o, e.baseUrl)
    }
    this.httpMethod = e.fileId ? 'PUT' : 'POST'
  }

  upload() {
    var e = new XMLHttpRequest
    e.open(this.httpMethod, this.url, !0), e.setRequestHeader('Authorization', 'Bearer ' + this.token), e.setRequestHeader('Content-Type', 'application/json'), e.setRequestHeader('X-Upload-Content-Length', this.file.size), e.setRequestHeader('X-Upload-Content-Type', this.contentType), e.onload = function(e) {
      if (e.target.status < 400) {
        var t = e.target.getResponseHeader('Location')
        this.url = t, this.sendFile_()
      } else this.onUploadError_(e)
    }.bind(this), e.onerror = this.onUploadError_.bind(this), e.send(JSON.stringify(this.metadata))
  }

  sendFile_() {
    var e = this.file, t = this.file.size;
    (this.offset || this.chunkSize) && (this.chunkSize && (t = Math.min(this.offset + this.chunkSize, this.file.size)), e = e.slice(this.offset, t))
    var o = new XMLHttpRequest
    o.open('PUT', this.url, !0), o.setRequestHeader('Content-Type', this.contentType), o.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (t - 1) + '/' + this.file.size), o.setRequestHeader('X-Upload-Content-Type', this.file.type), o.upload && o.upload.addEventListener('progress', this.onProgress), o.onload = this.onContentUploadSuccess_.bind(this), o.onerror = this.onContentUploadError_.bind(this), o.send(e)
  }

  resume_() {
    var e = new XMLHttpRequest
    e.open('PUT', this.url, !0), e.setRequestHeader('Content-Range', 'bytes */' + this.file.size), e.setRequestHeader('X-Upload-Content-Type', this.file.type), e.upload && e.upload.addEventListener('progress', this.onProgress), e.onload = this.onContentUploadSuccess_.bind(this), e.onerror = this.onContentUploadError_.bind(this), e.send()
  }

  extractRange_(e) {
    var t = e.getResponseHeader('Range')
    t && (this.offset = parseInt(t.match(/\d+/g).pop(), 10) + 1)
  }

  onContentUploadSuccess_(e) {
    if (200 === e.target.status || 201 === e.target.status) {
      this.onComplete(e.target.response)
    } else {
      if (308 === e.target.status) {
        this.extractRange_(e.target), this.retryHandler.reset(), this.sendFile_()
      } else {
        this.onContentUploadError_(e)
      }
    }
  }

  onContentUploadError_(e) {
    e.target.status && e.target.status < 500 ? this.onError(e.target.response) : this.retryHandler.retry(this.resume_.bind(this))
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
    var n = o
    e && (n += e)
    var r = this.buildQuery_(t)
    return r && (n += '?' + r), n
  }
}

var e = '<?= doGet({ channel: \'true\' }); ?>'

function s() {
  return $('#video_title').val()
}

function a() {
  return $('#video_description').val()
}

function d() {
  return ($('#video_tags').val() || '').split(',').slice(0, 5)
}

var l, u, t, o, i

class h {
  constructor() {
    this.videoId = ''
    this.uploadStartTime = 0
  }

  uploadFile(e, t) {
    var o = !1
    const n = {
      snippet: { title: s(), description: a(), categoryId: $('#video_category').val(), tags: d() },
      status: { privacyStatus: $('#video_privacy').val() },
    }
    const i = new r({
      baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
      file: e,
      token: t,
      metadata: n,
      params: {
        part: Object.keys(n).join(','),
        notifySubscribers: !1,
      },
      onError: function(e) {
        var t = e
        try {
          t = JSON.parse(e).error.message
        } finally {
          p(!0, t)
        }
      }.bind(this),
      onProgress: function(e) {
        var t = e.loaded, n = e.total, r = 100 * t / n
        $('#percent-transferred').text(r.toFixed(2))
        $('#bytes-transferred').text((t / 1048576).toFixed(3))
        $('#total-bytes').text((n / 1048576).toFixed(3))
        o || (o = !0, u.show())
        if (100 === r) {
          u.hide()
          l.html('Video uploaded, processing..')
          $('#terms').hide()
        }
      }.bind(this),
      onComplete: function(e) {
        var t = JSON.parse(e)
        this.videoId = t.id, google.script.run.doGet({
          upload: !0,
          id: this.videoId,
          title: s(),
          text: a(),
        }), setTimeout(function() {
          $('form#youtubeForm').html('<h5 class="center teal-text light">Your video has been received. Thank you!</h5>')
        }, 6e3)
      }.bind(this),
    })
    this.uploadStartTime = Date.now(), i.upload()
  }
}

function run(e) {
  if (2 === e) {
    // return f()
  } else if (3 === e) {
    return $('#h5').hide(), $('#terms').hide(), void $('#upgrade').removeClass('hide')
  } else {
    if (i.valid()) {
      return void p(!1), google.script.run.withSuccessHandler(function(e) {
        (new h).uploadFile($('#file').get(0).files[0], e)
      }).doGet({ initialize: 'upload' })
    } else {
      return void window.setTimeout(function() {
        t.resetForm()
      }, 5e3)
    }
  }
}

$(document).ready(function() {
  $.validator.setDefaults({ ignore: [] }), $('select').formSelect(), l = $('#message'), u = $('#progress'), o = $('#btnUpload'), i = $('form'), t = i.validate({
    errorElement: 'div',
    errorPlacement: function(e, t) {
      var o = $(t).data('error')
      o ? $(o).append(e) : e.insertAfter(t)
    },
  })
})
