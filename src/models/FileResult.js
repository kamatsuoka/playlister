/**
 * Result of successful MediaInfo analysis of file
 */
class FileResult {
  constructor({name, format, startTime, duration}) {
    this.name = name
    this.format = format
    this.startTime = startTime
    this.duration = duration
  }
}

/**
 * Result of unsuccessful MediaInfo analysis of file
 */
class FileError {
  constructor({name, error}) {
    this.name = name
    this.error = error
  }
}
