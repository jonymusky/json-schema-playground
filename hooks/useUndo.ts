import { useCallback, useReducer } from 'react'

interface History<T> {
  past: T[]
  present: T
  future: T[]
  lastKey?: string
  lastAt: number
}

type Action<T> =
  | { type: 'set'; value: T; key?: string }
  | { type: 'reset'; value: T }
  | { type: 'undo' }
  | { type: 'redo' }

const LIMIT = 100
const COALESCE_MS = 800

function reducer<T>(history: History<T>, action: Action<T>): History<T> {
  switch (action.type) {
    case 'set': {
      const now = Date.now()
      // Consecutive edits to the same field (e.g. typing) collapse into one undo step.
      const coalesce = action.key !== undefined && action.key === history.lastKey && now - history.lastAt < COALESCE_MS
      return {
        past: coalesce ? history.past : [...history.past, history.present].slice(-LIMIT),
        present: action.value,
        future: [],
        lastKey: action.key,
        lastAt: now,
      }
    }
    case 'reset':
      return { past: [], present: action.value, future: [], lastAt: 0 }
    case 'undo': {
      if (!history.past.length) return history
      return {
        past: history.past.slice(0, -1),
        present: history.past[history.past.length - 1],
        future: [history.present, ...history.future],
        lastAt: 0,
      }
    }
    case 'redo': {
      if (!history.future.length) return history
      return {
        past: [...history.past, history.present],
        present: history.future[0],
        future: history.future.slice(1),
        lastAt: 0,
      }
    }
  }
}

export function useUndo<T>(initialState: T) {
  const [history, dispatch] = useReducer(reducer<T>, { past: [], present: initialState, future: [], lastAt: 0 })

  /** Pass a `key` to merge rapid consecutive edits of the same thing into one history entry. */
  const setState = useCallback((value: T, key?: string) => dispatch({ type: 'set', value, key }), [])
  const resetState = useCallback((value: T) => dispatch({ type: 'reset', value }), [])
  const undo = useCallback(() => dispatch({ type: 'undo' }), [])
  const redo = useCallback(() => dispatch({ type: 'redo' }), [])

  return {
    state: history.present,
    setState,
    resetState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
