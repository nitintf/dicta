import { Check, AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import type { PermissionCardProps } from '../types'

export function PermissionCard({
  icon,
  title,
  description,
  status,
  onRequest,
  required = false,
}: PermissionCardProps) {
  const [requesting, setRequesting] = useState(false)

  const handleRequest = async () => {
    setRequesting(true)
    await onRequest()
    setRequesting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-lg border border-gray-700/50 bg-gray-800/50 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-gray-700/50 p-3">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{title}</h3>
            {required && (
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                Required
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-400">{description}</p>

          <div className="mt-4 flex items-center gap-3">
            {status === 'granted' ? (
              <div className="flex items-center gap-2 text-green-400">
                <Check size={16} />
                <span className="text-sm">Granted</span>
              </div>
            ) : status === 'denied' ? (
              <>
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={16} />
                  <span className="text-sm">Denied</span>
                </div>
                <button
                  onClick={handleRequest}
                  disabled={requesting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {requesting ? 'Opening Settings...' : 'Open Settings'}
                </button>
              </>
            ) : (
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {requesting ? 'Requesting...' : 'Grant Permission'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
