'use client'

import type { FC } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { SendForm } from './SendForm'
import { Settings } from './Settings'
import { decryptMnemonic } from '@/lib/secureStorage'

type WalletProps = {
  mnemonic: string
  address: string
  privateKeyWIF: string
  qrCodeDataUrl: string
  balance: number
}

type Props = {
  wallet: WalletProps
}

export const WalletDisplay: FC<Props> = ({ wallet }) => {
  const [showSendForm, setShowSendForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)

  const pricePerTUR = 0.05
  const usdValue = (wallet.balance * pricePerTUR).toFixed(2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Failed to copy address.')
    }
  }

  const handlePasswordCheck = async (password: string) => {
    const encrypted = localStorage.getItem('turionEncryptedWallet')
    if (!encrypted) return false
    const decrypted = await decryptMnemonic(encrypted, password)
    return !!decrypted
  }

  const handleLogout = () => {
    localStorage.removeItem('turionEncryptedWallet')
    window.location.reload()
  }

  return (
    <div className="bg-[#1e1e2f] text-white p-4 sm:p-6 rounded-xl shadow-xl space-y-6">
      {/* QR Code with shield background */}
      <div className="relative w-full flex justify-center">
        <div className="relative">
          <Image
            src="/shield.png"
            alt="Background Shield"
            width={144}
            height={144}
            className="absolute top-0 left-0 opacity-20"
          />
          <Image
            src={wallet.qrCodeDataUrl}
            alt="QR Code"
            width={144}
            height={144}
            className="rounded-lg border border-gray-600 shadow-lg relative z-10"
          />
        </div>
      </div>

      {/* Wallet address and copy */}
      {!showSendForm && !showSettings && (
        <div className="text-center text-sm space-y-2">
          <p className="text-purple-400 font-semibold">Wallet Address:</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <p className="text-blue-300 break-all">{wallet.address}</p>
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              📋 Copy
            </button>
          </div>
          {copied && (
            <div className="text-green-400 text-xs mt-1 animate-fade-in-out">
              ✅ Copied to clipboard!
            </div>
          )}
        </div>
      )}

      {/* Balance info */}
      {!showSendForm && !showSettings && (
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-400">Available Balance</p>
          <p className="text-4xl font-bold text-purple-400">{wallet.balance} TUR</p>
          <p className="text-lg text-green-400">${usdValue}</p>
        </div>
      )}

      {/* Action buttons */}
      {!showSendForm && !showSettings && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowSendForm(true)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            📤 Send
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
          >
            ⚙️ Settings
          </button>
        </div>
      )}

      {/* Coin details */}
      {!showSendForm && !showSettings && (
        <div className="flex items-center gap-4 p-3 bg-[#2a2a3d] rounded-lg shadow">
          <Image src="/shield.png" alt="Turion" width={40} height={40} />
          <div className="flex-1">
            <p className="font-semibold text-white">Turion</p>
            <p className="text-sm text-gray-400">{wallet.balance} TUR</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-semibold">${usdValue}</p>
          </div>
        </div>
      )}

      {/* Send Form */}
      {showSendForm && (
        <SendForm
          balance={wallet.balance}
          onCancel={() => setShowSendForm(false)}
          onConfirm={(data) => {
            console.log('Sending:', data)
            setShowSendForm(false)
          }}
        />
      )}

      {/* Settings */}
      {showSettings && (
        <Settings
          wallet={wallet}
          onBack={() => setShowSettings(false)}
          onPasswordCheck={handlePasswordCheck}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
