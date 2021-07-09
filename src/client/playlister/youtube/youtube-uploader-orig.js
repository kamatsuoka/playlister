var n = function() {
  this.interval = 1e3, this.maxInterval = 6e4
}
n.prototype.retry = function(e) {
  setTimeout(e, this.interval), this.interval = this.nextInterval_()
}, n.prototype.reset = function() {
  this.interval = 1e3
}, n.prototype.nextInterval_ = function() {
  var e = 2 * this.interval + this.getRandomInt_(0, 1e3)
  return Math.min(e, this.maxInterval)
}, n.prototype.getRandomInt_ = function(e, t) {
  return Math.floor(Math.random() * (t - e + 1) + e)
}
var r = function(e) {
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
r.prototype.upload = function() {
  var e = new XMLHttpRequest
  e.open(this.httpMethod, this.url, !0), e.setRequestHeader('Authorization', 'Bearer ' + this.token), e.setRequestHeader('Content-Type', 'application/json'), e.setRequestHeader('X-Upload-Content-Length', this.file.size), e.setRequestHeader('X-Upload-Content-Type', this.contentType), e.onload = function(e) {
    if (e.target.status < 400) {
      var t = e.target.getResponseHeader('Location')
      this.url = t, this.sendFile_()
    } else this.onUploadError_(e)
  }.bind(this), e.onerror = this.onUploadError_.bind(this), e.send(JSON.stringify(this.metadata))
}, r.prototype.sendFile_ = function() {
  var e = this.file, t = this.file.size;
  (this.offset || this.chunkSize) && (this.chunkSize && (t = Math.min(this.offset + this.chunkSize, this.file.size)), e = e.slice(this.offset, t))
  var o = new XMLHttpRequest
  o.open('PUT', this.url, !0), o.setRequestHeader('Content-Type', this.contentType), o.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (t - 1) + '/' + this.file.size), o.setRequestHeader('X-Upload-Content-Type', this.file.type), o.upload && o.upload.addEventListener('progress', this.onProgress), o.onload = this.onContentUploadSuccess_.bind(this), o.onerror = this.onContentUploadError_.bind(this), o.send(e)
}, r.prototype.resume_ = function() {
  var e = new XMLHttpRequest
  e.open('PUT', this.url, !0), e.setRequestHeader('Content-Range', 'bytes */' + this.file.size), e.setRequestHeader('X-Upload-Content-Type', this.file.type), e.upload && e.upload.addEventListener('progress', this.onProgress), e.onload = this.onContentUploadSuccess_.bind(this), e.onerror = this.onContentUploadError_.bind(this), e.send()
}, r.prototype.extractRange_ = function(e) {
  var t = e.getResponseHeader('Range')
  t && (this.offset = parseInt(t.match(/\d+/g).pop(), 10) + 1)
}, r.prototype.onContentUploadSuccess_ = function(e) {
  200 == e.target.status || 201 == e.target.status ? this.onComplete(e.target.response) : 308 == e.target.status ? (this.extractRange_(e.target), this.retryHandler.reset(), this.sendFile_()) : this.onContentUploadError_(e)
}, r.prototype.onContentUploadError_ = function(e) {
  e.target.status && e.target.status < 500 ? this.onError(e.target.response) : this.retryHandler.retry(this.resume_.bind(this))
}, r.prototype.onUploadError_ = function(e) {
  this.onError(e.target.response)
}, r.prototype.buildQuery_ = function(e) {
  return e = e || {}, Object.keys(e).map(function(t) {
    return encodeURIComponent(t) + '=' + encodeURIComponent(e[t])
  }).join('&')
}, r.prototype.buildUrl_ = function(e, t, o) {
  var n = o
  e && (n += e)
  var r = this.buildQuery_(t)
  return r && (n += '?' + r), n
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

'' === e ? $('form#youtubeForm').html($('div#nochannel').html()) : -1 !== e.indexOf(' ') && $('form#youtubeForm').html(e), Number('<?= doGet({ since: \'true\' }); ?>') < Date.now() ? ($('#upgrade').removeClass('hide'), $('#upload').hide()) : $('#activate').hide()
var l, u, t, o, i, h = function() {
  this.videoId = '', this.uploadStartTime = 0
}

function p(e, t) {
  l.html(t || ''), e ? ($('button.reset').click(), o.removeClass('disabled'), u.hide()) : o.addClass('disabled')
}

function c(e) {
  $('p#al').text(e || 'Please enter a valid license key')
}

function f() {
  var e = document.getElementById('license_key').value.trim();
  /^GA21/.test(e) ? (c('Verifying...'), google.script.run.withSuccessHandler(function(e) {
    c('' === e ? 'License verified. Please reload this page' : e)
  }).doGet({ key: e })) : c()
}

function run(e) {
  return 2 === e ? f() : 3 === e ? ($('#h5').hide(), $('#terms').hide(), void $('#upgrade').removeClass('hide')) : void (i.valid() ? (p(!1), google.script.run.withSuccessHandler(function(e) {
    (new h).uploadFile($('#file').get(0).files[0], e)
  }).doGet({ initialize: 'upload' })) : window.setTimeout(function() {
    t.resetForm()
  }, 5e3))
}

h.prototype.uploadFile = function(e, t) {
  var o = !1, n = {
    snippet: { title: s(), description: a(), categoryId: $('#video_category').val(), tags: d() },
    status: { privacyStatus: $('#video_privacy').val() },
  }, i = new r({
    baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
    file: e,
    token: t,
    metadata: n,
    params: { part: Object.keys(n).join(','), notifySubscribers: !1 },
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
      $('#percent-transferred').text(r.toFixed(2)), $('#bytes-transferred').text((t / 1048576).toFixed(3)), $('#total-bytes').text((n / 1048576).toFixed(3)), o || (o = !0, u.show()), 100 === r && (u.hide(), l.html('Video uploaded, processing..'), $('#terms').hide())
    }.bind(this),
    onComplete: function(e) {
      var t = JSON.parse(e)
      this.videoId = t.id
      google.script.run.doGet({
        upload: !0,
        id: this.videoId,
        title: s(),
        text: a(),
      })
      setTimeout(function() {
        $('form#youtubeForm').html('<h5 class="center teal-text light">Your video has been received. Thank you!</h5>')
      }, 6e3)
    }.bind(this),
  })
  this.uploadStartTime = Date.now(), i.upload()
}, $(document).ready(function() {
  $.validator.setDefaults({ ignore: [] }), $('select').formSelect(), l = $('#message'), u = $('#progress'), o = $('#btnUpload'), i = $('form'), t = i.validate({
    errorElement: 'div',
    errorPlacement: function(e, t) {
      var o = $(t).data('error')
      o ? $(o).append(e) : e.insertAfter(t)
    },
  })
})
