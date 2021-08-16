# Playlister

A Google Apps Script web app for 
- uploading event videos to youtube
- creating a playlist for the event
- adding videos to the playlist
- renaming videos in a standard way
- adding video metadata to a google sheet to keep track of highlights

## Origins

- Originally I tried to implement this as a standalone app, outside of Apps Script. 
  But eventually I found that you can't create a playlist for someone else,
  which would mean you could only use the app if you were signed in to the 
  account that holds the videos. Using Apps Script get around that limitation
  by letting the account-holder grant permissions to the web app.
- This project is based on the [https://github.com/enuchi/React-Google-Apps-Script](React-Google-Apps-Script)
  template. At some point I chose to eject because there was something that I wasn't 
  able to change, but I can't remember what it was.

## Notes

- I attempted to keep track of the video start time (as extracted by mediainfo.js) by
  storing it in the recordingDetails.recordingDate field on insert. But somehow recordingDate
  gets truncated down to just the date (with no time) when fetching the video later.
  So I fell back to storing the start time in the description field. 


