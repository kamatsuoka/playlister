/**
 * Stores preferences that aren't expected to change too often
 */
import { copyData, usePersist } from '../hooks/usePersist'
import { Input } from 'baseui/input'
import { FormControl } from 'baseui/form-control'
import React, { useState } from 'react'
import { BaseCard } from './BaseCard'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { getAppsScriptRun } from '../util/auth'

const API_DATA_KEY = 'preferences'
const getPreferences = () => {
  const restoredJson = window.localStorage.getItem(API_DATA_KEY)
  if (restoredJson) {
    try {
      return JSON.parse(restoredJson)
    } catch {
      // no-op
    }
  }
  return {}
}
const PreferencePage = () => {
  const [preferences, setPreferences] = useState({ channelId: '', videoPrefix: 'fcs' })

  usePersist({
    key: API_DATA_KEY,
    onRestore: copyData,
    setState: setPreferences,
    state: preferences
  })

  return (
    <BaseCard title='Preferences'>
      <FlexGrid
        flexGridColumnCount={2}
        flexGridColumnGap='scale800'
        flexGridRowGap='scale800'
      >
        {getAppsScriptRun()
          ? null
          : <FlexGridItem>
            <FormControl label='youtube channel id'>
              <Input
                value={preferences.channelId || ''}
                onChange={e => setPreferences({ ...preferences, channelId: e.target.value })}
              />
            </FormControl>
          </FlexGridItem>}
        <FlexGridItem>
          <FormControl label='video prefix'>
            <Input
              value={preferences.videoPrefix || ''}
              onChange={e => setPreferences({ ...preferences, videoPrefix: e.target.value })}
            />
          </FormControl>
        </FlexGridItem>
      </FlexGrid>
    </BaseCard>
  )
}

export { getPreferences, PreferencePage }
