'use client'

import { useEffect, useState } from 'react'
import { WalletActions } from '@/components/WalletActions'
import { WalletForm } from '@/components/WalletForm'
import { WalletDisplay } from '@/components/WalletDisplay'
import { encryptMnemonic, decryptMnemonic } from '@/lib/secureStorage'
import { generateMnemonicWallet, restoreMnemonicWallet, WalletData } from '@/lib/wallet'

export default function HomePage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [awaitingPassword, setAwaitingPassword] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('turionEncryptedWallet')
    if (saved) setAwaitingPassword(true)
  }, [])

  const handleCreateWallet = async (password: string) => {
    const newWallet = await generateMnemonicWallet()
    const encrypted = await encryptMnemonic(newWallet.mnemonic, password)
    localStorage.setItem('turionEncryptedWallet', encrypted)
    setWallet(newWallet)
  }

  const handleRestoreWallet = async (data: WalletData, password: string) => {
    const encrypted = await encryptMnemonic(data.mnemonic, password)
    localStorage.setItem('turionEncryptedWallet', encrypted)
    setWallet(data)
  }

  const handleUnlockWallet = async () => {
    const encrypted = localStorage.getItem('turionEncryptedWallet')
    if (!encrypted || !passwordInput) return

    const decryptedMnemonic = await decryptMnemonic(encrypted, passwordInput)
    if (!decryptedMnemonic) {
      alert('Invalid password.')
      return
    }

    const restored = await restoreMnemonicWallet(decryptedMnemonic)
    setWallet(restored)
    setAwaitingPassword(false)
    setPasswordInput('')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-xl mx-auto bg-[#1e1e2f] p-6 rounded-xl shadow-lg space-y-6 text-white">
        <h1 className="text-2xl font-bold text-center text-purple-400">
          Turion Wallet
        </h1>

        {/* Solicitação de senha */}
        {awaitingPassword && !wallet && (
          <div className="space-y-4">
            <p className="text-center text-gray-400 text-sm">Enter your wallet password</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Wallet password"
            />
            <button
              onClick={handleUnlockWallet}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition font-semibold"
            >
              🔓 Unlock Wallet
            </button>
          </div>
        )}

        {!wallet && !awaitingPassword && !showForm && (
          <WalletActions
            onCreateWallet={() => setIsCreating(true)}
            onConnectClick={() => setShowForm(true)}
          />
        )}

        {/* Campo para senha ao criar nova carteira */}
        {!wallet && isCreating && (
          <div className="space-y-4">
            <p className="text-center text-gray-400 text-sm">Set a password to secure your new wallet</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="New wallet password"
            />
            <button
              onClick={() => {
                if (passwordInput) {
                  handleCreateWallet(passwordInput)
                  setIsCreating(false)
                }
              }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition font-semibold"
            >
              🎉 Create Wallet
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setPasswordInput('')
              }}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition font-semibold"
            >
              ⬅ Cancel
            </button>
          </div>
        )}

        {/* Restauração da carteira com senha */}
        {!wallet && showForm && (
          <WalletForm
            onRestore={(data) => {
              const pwd = prompt('Set a password to encrypt this wallet:')
              if (!pwd) return
              handleRestoreWallet(data, pwd)
            }}
            onBack={() => setShowForm(false)}
          />
        )}

        {wallet && <WalletDisplay wallet={wallet} />}
      </div>
    </main>
  )
}
