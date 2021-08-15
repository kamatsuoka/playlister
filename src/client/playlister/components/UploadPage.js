import React from 'react'
import PrevNextButtons from './PrevNextButtons'
import { createTheme, lightThemePrimitives, ThemeProvider, useStyletron } from 'baseui'
import { StyledLink } from 'baseui/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'

export const uploadTooltip = (
  <>
    You can upload your videos here or on {' '}
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
    If you upload them on YouTube, click sync &nbsp;
    <FontAwesomeIcon className='fa-padded' icon={faSyncAlt} size='sm' />
    &nbsp; to locate them
  </>
)

export const UploadPrevNext = ({ uploadStep, setUploadStep, prevProps, nextProps, ...otherProps }) => {
  const [css, theme] = useStyletron()
  return (
    <div className={css({ marginTop: theme.sizing.scale600 })}>
      <PrevNextButtons
        current={uploadStep} setCurrent={setUploadStep} align='left'
        prevProps={{ grayed: true, icon: faArrowUp, ...prevProps }} nextProps={{ icon: faArrowDown, ...nextProps }}
        textual {...otherProps}
      />
    </div>
  )
}
