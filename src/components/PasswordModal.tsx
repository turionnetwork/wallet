'use client'

import { FC, useState } from 'react'

type Props = {
  onConfirm: (password: string) => void
  onCancel: () => void
}

export const PasswordModal: FC<Props> = ({ onConfirm, onCancel }) => {
  const [password, setPassword] = useState('')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1e1e2f] text-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4 border border-purple-600">
        <h2 className="text-xl font-bold text-center text-purple-400">Enter your password</h2>

        <input
          type="password"
          className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-between gap-4 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(password)}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium"
            disabled={!password}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
