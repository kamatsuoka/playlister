function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('YouTube Uploader').addMetaTag('viewport', 'width=device-width, initial-scale=1')
}

function getToken() {
  return ScriptApp.getOAuthToken()
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}
