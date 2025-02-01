import * as React from 'react'
import { useEffect } from 'react'

export const useBarcode = (
  callback?: (barcode: string) => void
) => {
  const minLength = 8
  const prefix = ''
  const suffix = ''
  const avgTimeInputThreshold = 24

  // Refs to keep track of mutable state without causing re-renders
  const inputStackRef = React.useRef<string[]>([])
  const lastInputTimeRef = React.useRef<number | null>(null)
  const avgInputTimeRef = React.useRef<number>(0)
  const detectingScanningRef = React.useRef<boolean>(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleKeyInput = React.useCallback(
    (key: string) => {
      // Filter out non-printable keys
      if (key.length !== 1) {
        return
      }

      const currentInputTime = Date.now()
      let timeBetweenInputs = 0
      if (lastInputTimeRef.current !== null) {
        timeBetweenInputs = currentInputTime - lastInputTimeRef.current
      }

      // Update average input time
      if (avgInputTimeRef.current === 0) {
        avgInputTimeRef.current = timeBetweenInputs
      } else {
        avgInputTimeRef.current = (avgInputTimeRef.current + timeBetweenInputs) / 2
      }

      if (detectingScanningRef.current || avgInputTimeRef.current < avgTimeInputThreshold) {
        detectingScanningRef.current = true
        inputStackRef.current.push(key)

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set timeout to detect end of scanning
        timeoutRef.current = setTimeout(() => {
          if (
            detectingScanningRef.current &&
            Date.now() - (lastInputTimeRef.current || 0) > avgTimeInputThreshold
          ) {
            // Stop scanning detection
            detectingScanningRef.current = false

            // Remove prefix and suffix if necessary
            const inputStack = [...inputStackRef.current]
            if (prefix && inputStack[0] === prefix) {
              inputStack.shift()
            }

            if (suffix && inputStack[inputStack.length - 1] === suffix) {
              inputStack.pop()
            }

            const barcode = inputStack.join('')

            if (barcode.length >= minLength) {
              if (callback) {
                callback(barcode)
              }
            }

            // Reset variables
            inputStackRef.current = []
            avgInputTimeRef.current = 0
          }
        }, 150)
      } else {
        // Reset average input time and start a new input stack
        avgInputTimeRef.current = 0
        inputStackRef.current = [key]
      }

      lastInputTimeRef.current = currentInputTime
    },
    [avgTimeInputThreshold, prefix, suffix, minLength, callback]
  )

  /**
   * Event handler for keyup event (Web).
   */
  const onKeyUp = React.useCallback(
    (e: KeyboardEvent) => {
      const ignoreInput = (e.target as any)?.tagName === 'INPUT' || (e.target as any)?.tagName === 'TEXTAREA'
      if (!ignoreInput) {
        handleKeyInput(e.key)
      }
    },
    [handleKeyInput]
  )

  useEffect(
    React.useCallback(() => {
      // reverted to keydown, because keyup was only giving lowercase
      document.addEventListener('keydown', onKeyUp)

      return () => {
        document.removeEventListener('keydown', onKeyUp)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [onKeyUp])
  )
}
