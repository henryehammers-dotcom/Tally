import { useRef, useCallback } from 'react'

export function usePressTiers({ onTap, onOptions, onDragStart, onDragMove, onDragEnd }) {
  const optionsTimerRef = useRef(null)
  const stateRef = useRef('idle')
  const startPosRef = useRef({ x: 0, y: 0 })

  const OPTIONS_DELAY = 450
  const DRAG_MOVE_THRESHOLD = 8

  function vibrate(ms = 15) {
    if (navigator.vibrate) navigator.vibrate(ms)
  }

  function clearTimer() {
    if (optionsTimerRef.current) {
      clearTimeout(optionsTimerRef.current)
      optionsTimerRef.current = null
    }
  }

  const handleStart = useCallback(
    (clientX, clientY) => {
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
      if (stateRef.current === 'options') {
        const dx = clientX - startPosRef.current.x
        const dy = clientY - startPosRef.current.y
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_MOVE_THRESHOLD) {
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
    if (stateRef.current === 'pending') {
      onTap?.()
    } else if (stateRef.current === 'dragging') {
      onDragEnd?.()
    }
    stateRef.current = 'idle'
  }, [onTap, onDragEnd])

  return {
    onTouchStart: (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: handleEnd,
    onTouchCancel: () => {
      clearTimer()
      stateRef.current = 'idle'
    },
    onMouseDown: (e) => handleStart(e.clientX, e.clientY),
    onMouseMove: (e) => {
      if (stateRef.current !== 'idle') handleMove(e.clientX, e.clientY)
    },
    onMouseUp: handleEnd,
    onMouseLeave: () => {
      clearTimer()
      stateRef.current = 'idle'
    },
    onContextMenu: (e) => {
      e.preventDefault()
      clearTimer()
      stateRef.current = 'idle'
      onOptions?.()
    },
  }
}
