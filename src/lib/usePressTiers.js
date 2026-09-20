import { useRef, useCallback } from 'react'

const OPTIONS_DELAY = 450
// Finger travel that turns a press into a scroll. iOS itself starts
// scrolling after roughly this much, and a real tap wobbles well under it.
const SCROLL_CANCEL_THRESHOLD = 10
const DRAG_MOVE_THRESHOLD = 8

// States: idle -> pending (finger down, undecided)
//   pending -> [release] tap
//   pending -> [moved past threshold] scrolling (browser owns the gesture; no tap, no options)
//   pending -> [held 450ms] options -> [moved] dragging -> [release] drag end
export function usePressTiers({ onTap, onOptions, onDragStart, onDragMove, onDragEnd }) {
  const optionsTimerRef = useRef(null)
  const stateRef = useRef('idle')
  const startPosRef = useRef({ x: 0, y: 0 })
  const elementRef = useRef(null)

  function vibrate(ms = 15) {
    if (navigator.vibrate) navigator.vibrate(ms)
  }

  function clearTimer() {
    if (optionsTimerRef.current) {
      clearTimeout(optionsTimerRef.current)
      optionsTimerRef.current = null
    }
  }

  function reset() {
    clearTimer()
    stateRef.current = 'idle'
  }

  // Cards allow native vertical scrolling (touch-action: pan-y), so the only
  // time we must stop the page scrolling is once a long-press has started a
  // drag-to-reorder. React's onTouchMove is passive and can't do that, so this
  // is a native non-passive listener.
  const blockScrollWhileDragging = useCallback((e) => {
    if ((stateRef.current === 'options' || stateRef.current === 'dragging') && e.cancelable) {
      e.preventDefault()
    }
  }, [])

  const pressRef = useCallback(
    (el) => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchmove', blockScrollWhileDragging)
      }
      elementRef.current = el
      if (el) el.addEventListener('touchmove', blockScrollWhileDragging, { passive: false })
    },
    [blockScrollWhileDragging]
  )

  const handleStart = useCallback(
    (clientX, clientY) => {
      clearTimer()
      stateRef.current = 'pending'
      startPosRef.current = { x: clientX, y: clientY }
      optionsTimerRef.current = setTimeout(() => {
        stateRef.current = 'options'
        vibrate(15)
        onOptions?.()
      }, OPTIONS_DELAY)
    },
    [onOptions]
  )

  const handleMove = useCallback(
    (clientX, clientY) => {
      const dx = clientX - startPosRef.current.x
      const dy = clientY - startPosRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (stateRef.current === 'pending') {
        if (distance > SCROLL_CANCEL_THRESHOLD) {
          clearTimer()
          stateRef.current = 'scrolling'
        }
      } else if (stateRef.current === 'options') {
        if (distance > DRAG_MOVE_THRESHOLD) {
          stateRef.current = 'dragging'
          vibrate(10)
          onDragStart?.()
        }
      } else if (stateRef.current === 'dragging') {
        onDragMove?.(clientX, clientY)
      }
    },
    [onDragStart, onDragMove]
  )

  const handleEnd = useCallback(() => {
    clearTimer()
    const state = stateRef.current
    stateRef.current = 'idle'
    if (state === 'pending') {
      onTap?.()
    } else if (state === 'dragging') {
      onDragEnd?.()
    }
  }, [onTap, onDragEnd])

  return {
    ref: pressRef,
    onTouchStart: (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: handleEnd,
    onTouchCancel: reset,
    onMouseDown: (e) => handleStart(e.clientX, e.clientY),
    onMouseMove: (e) => {
      if (stateRef.current !== 'idle') handleMove(e.clientX, e.clientY)
    },
    onMouseUp: handleEnd,
    onMouseLeave: reset,
    onContextMenu: (e) => {
      e.preventDefault()
      reset()
      onOptions?.()
    },
  }
}
