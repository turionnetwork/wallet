'use client'

import { FC, useState } from 'react'
import { restoreMnemonicWallet, WalletData } from '@/lib/wallet'

type Props = {
  onComplete: (walletData: WalletData, password: string) => void
  onCancel: () => void
}

export const RestoreWalletOnboarding: FC<Props> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1)
  const [mnemonicInput, setMnemonicInput] = useState<string[]>(Array(12).fill(''))
  const [walletName, setWalletName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const isMnemonicComplete = mnemonicInput.every(w => w.trim() !== '')
  const isNameValid = walletName.trim().length > 0
  const isPasswordValid = password.length >= 6

  const handleVerifyMnemonic = async () => {
    const phrase = mnemonicInput.join(' ').trim()
    try {
      await restoreMnemonicWallet(phrase)
      setError('')
      setStep(2)
    } catch {
      setError('Invalid seed phrase. Please check your 12 words.')
    }
  }

  const handleFinish = async () => {
    const phrase = mnemonicInput.join(' ').trim()
    try {
      const wallet = await restoreMnemonicWallet(phrase)
      onComplete(wallet, password)
    } catch {
      setError('Failed to restore wallet. Please check your data.')
    }
  }

  return (
    <div className="bg-[#1e1e2f] p-6 rounded-xl shadow-lg space-y-6 text-white w-full max-w-xl mx-auto">
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Step 1: Enter 12‑Word Phrase</h2>
          <p className="text-sm text-gray-400 mb-3">Enter each word in the correct order.</p>
          <div className="grid grid-cols-3 gap-2">
            {mnemonicInput.map((word, i) => (
              <input
                key={i}
                type="text"
                value={word}
                onChange={e => {
                  const arr = [...mnemonicInput]
                  arr[i] = e.target.value
                  setMnemonicInput(arr)
                }}
                className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                placeholder={`Word ${i + 1}`}
              />
            ))}
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <div className="flex justify-between space-x-4 mt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyMnemonic}
              disabled={!isMnemonicComplete}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded transition font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Step 2: Name Your Wallet</h2>
          <input
            type="text"
            value={walletName}
            onChange={e => setWalletName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="Enter a name"
          />
          <div className="flex justify-between space-x-4 mt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded transition font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!isNameValid}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded transition font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Step 3: Create Wallet Password</h2>
          <p className="text-gray-400 text-sm mb-2">Please choose a strong password (min 6 characters).</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="Set password"
          />
          <div className="flex justify-between space-x-4 mt-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded transition font-medium"
            >
              ← Back
            </button>
            <button
              onClick={handleFinish}
              disabled={!isPasswordValid}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded transition font-medium disabled:opacity-50"
            >
              🎉 Restore Wallet
            </button>
          </div>
        </>
      )}
    </div>
  )
}
