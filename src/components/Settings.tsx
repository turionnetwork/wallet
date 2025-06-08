'use client'

import type { FC } from 'react'
import { useState } from 'react'

type Props = {
  wallet: {
    mnemonic: string
    address: string
    privateKeyWIF: string
    qrCodeDataUrl: string
    balance: number
  }
  onBack: () => void
  onPasswordCheck: (password: string) => Promise<boolean>
}

export const Settings: FC<Props> = ({ wallet, onBack, onPasswordCheck }) => {
  const [password, setPassword] = useState('')
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState<'mnemonic' | 'privateKeyWIF' | null>(null)

  const handleConfirm = async () => {
    const ok = await onPasswordCheck(password)
    if (ok) {
      setVerified(true)
      setError('')
    } else {
      setError('Invalid password.')
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <button
        onClick={onBack}
        className="text-purple-400 hover:underline"
      >
        ← Back
      </button>

      <h2 className="text-xl font-bold">Settings</h2>

      {!verified && (
        <div className="space-y-3">
          <p className="text-gray-300">Enter your password to view sensitive data:</p>
          <input
            type="password"
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
            placeholder="Wallet password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400">{error}</p>}
          <button
            onClick={handleConfirm}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition"
          >
            ✅ Confirm
          </button>
        </div>
      )}

      {verified && (
        <div className="space-y-4">
          <div className="bg-[#2a2a3d] p-4 rounded-lg">
            <p className="text-gray-400 font-semibold">Wallet Name:</p>
            <p className="text-white">Turion Wallet</p>
          </div>

          <div className="bg-[#2a2a3d] p-4 rounded-lg">
            <p className="text-gray-400 font-semibold">Mnemonic (12 words)</p>
            {showSecret === 'mnemonic' ? (
              <p className="text-yellow-300 mt-2">{wallet.mnemonic}</p>
            ) : (
              <div>
                <div className="blur-sm select-none text-yellow-300 mt-2">**** **** ****</div>
                <button
                  onClick={() => setShowSecret('mnemonic')}
                  className="mt-2 text-sm text-blue-400 underline"
                >
                  Are you sure you want to view mnemonic?
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#2a2a3d] p-4 rounded-lg">
            <p className="text-gray-400 font-semibold">Secret Key (WIF)</p>
            {showSecret === 'privateKeyWIF' ? (
              <p className="text-red-300 mt-2">{wallet.privateKeyWIF}</p>
            ) : (
              <div>
                <div className="blur-sm select-none text-red-300 mt-2">************************</div>
                <button
                  onClick={() => setShowSecret('privateKeyWIF')}
                  className="mt-2 text-sm text-blue-400 underline"
                >
                  Are you sure you want to view secret key?
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
