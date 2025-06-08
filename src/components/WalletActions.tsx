'use client'

import type { FC } from 'react'
import Image from 'next/image'

type Props = {
  onStartOnboarding: () => void
  onConnectClick: () => void
}

export const WalletActions: FC<Props> = ({ onStartOnboarding, onConnectClick }) => {
  return (
    <div className="text-center space-y-6">
      {/* Logo + Título */}
      <div className="flex flex-col items-center gap-2">
        <Image
          src="/shield.png"
          alt="Turion Shield"
          width={64}
          height={64}
          className="opacity-90"
        />
        <h2 className="text-xl font-bold text-purple-400">Turion Native Wallet</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Secure. Fast. Yours. Manage your native TUR with total privacy and full control.
        </p>
      </div>

      {/* Botões */}
      <div className="space-y-4">
        <button
          onClick={onStartOnboarding}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg text-white font-semibold transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none"
        >
          🎉 Create New Wallet
        </button>

        <button
          onClick={onConnectClick}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 shadow-lg text-white font-semibold transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none"
        >
          🔐 Restore with 12-word Phrase
        </button>
      </div>
    </div>
  )
}
