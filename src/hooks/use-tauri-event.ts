import { EventCallback, listen } from '@tauri-apps/api/event'
import { useEffect } from 'react'

/**
 * Hook to listen for Tauri events
 * @param event - The event to listen for
 * @param callback - The callback to call when the event is emitted
 * @returns A function to unsubscribe from the event
 */
export const useTauriEvent = <T>(
  event: string,
  callback: EventCallback<T>,
  dependencies: React.DependencyList = []
) => {
  useEffect(() => {
    let unlisten: (() => void) | undefined

    const setupListener = async () => {
      unlisten = await listen<T>(event, callback)
    }

    void setupListener()

    return () => {
      void unlisten?.()
    }
  }, [event, callback, ...dependencies])
}
