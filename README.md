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


## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\

So far there aren't really any tests 🥲

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
(Note that this link and the links that follow may no longer apply since I ejected.)

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
