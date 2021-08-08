import { useEffect } from 'react'

const restore = (key) => {
  const restoredJson = window.localStorage.getItem(key)
  if (restoredJson) {
    try {
      return JSON.parse(restoredJson)
    } catch {
      // Reset if data is corrupted
      window.localStorage.setItem(key, JSON.stringify({}))
      return {}
    }
  }
  return {}
}

const save = (key, state) =>
  window.localStorage.setItem(key, JSON.stringify(state))

const usePersist = ({ key, onRestore, setState, state, enabled = true }) => {
  useEffect(() => {
    if (enabled) {
      const restored = restore(key)
      if (Object.values(restored).some(value => value || value === 0 || value === false)) {
        // only restore if there's something to restore, otherwise use defaults
        console.log('restoring ', restored)
        setState(s => ({ ...s, ...onRestore(restored) }))
      }
    }
  }, [key, onRestore, setState])
  useEffect(() => {
    if (enabled) {
      save(key, state)
    }
  }, [key, state])
}

const copyData = data => ({ ...data })

export { copyData, usePersist }
