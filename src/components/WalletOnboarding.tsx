'use client'

import { FC, useState, useEffect } from 'react'
import { generateMnemonicWallet, WalletData } from '@/lib/wallet'

type Props = {
  onComplete: (wallet: WalletData, password: string) => void
}

export const WalletOnboarding: FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [walletName, setWalletName] = useState('')
  const [mnemonic, setMnemonic] = useState<string[]>([])
  const [confirmWords, setConfirmWords] = useState<{ index: number; word: string }[]>([])
  const [userInputs, setUserInputs] = useState<{ [index: number]: string }>({})
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Gera a carteira apenas uma vez no passo 3
  useEffect(() => {
    if (step === 3 && mnemonic.length === 0) {
      generateMnemonicWallet().then(w => {
        setMnemonic(w.mnemonic.split(' '))
      }).catch(console.error)
    }
  }, [step, mnemonic])

  // Gera palavras aleatórias para confirmação no passo 4
  useEffect(() => {
    if (step === 4 && mnemonic.length === 12 && confirmWords.length === 0) {
      const indexes = new Set<number>()
      while (indexes.size < 3) {
        indexes.add(Math.floor(Math.random() * 12))
      }
      const selected = Array.from(indexes).map(i => ({
        index: i,
        word: mnemonic[i],
      }))
      setConfirmWords(selected)
    }
  }, [step, mnemonic, confirmWords])

  const handleCheckWords = () => {
    const valid = confirmWords.every(({ index, word }) =>
      userInputs[index]?.trim().toLowerCase() === word.toLowerCase()
    )
    if (!valid) {
      setError('The words you entered are incorrect.')
    } else {
      setError('')
      setStep(5)
    }
  }

  const handleComplete = async () => {
    try {
      const result = await generateMnemonicWallet()
      onComplete(result, password)
    } catch (err) {
      console.error('Error generating wallet:', err)
    }
  }

  return (
    <div className="space-y-6 text-white bg-[#1e1e2f] p-6 rounded-xl shadow-lg w-full max-w-xl mx-auto">
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold">Step 1: Wallet Name</h2>
          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="Enter a name for your wallet"
          />
          <button
            onClick={() => setStep(2)}
            className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded transition font-semibold"
            disabled={!walletName.trim()}
          >
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold">Step 2: Seed Phrase Safety</h2>
          <p className="text-gray-300 text-sm mt-2">
            Your seed phrase is the only way to recover your wallet.
            <br />
            <span className="text-yellow-400 font-semibold">Never share it with anyone</span> and always store it in a safe place.
          </p>
          <button
            onClick={() => setStep(3)}
            className="w-full py-2 mt-6 bg-purple-600 hover:bg-purple-700 rounded transition font-semibold"
          >
            I Understand
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold">Step 3: Save Your 12 Words</h2>
          <p className="text-sm text-gray-400 mb-2">Write these words down in the correct order:</p>
          <div className="grid grid-cols-3 gap-2 text-yellow-300">
            {mnemonic.map((word, i) => (
              <div key={i} className="p-2 bg-gray-800 rounded text-center border border-gray-700">
                {i + 1}. {word}
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(4)}
            className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded transition font-semibold"
          >
            I've Noted It Down
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <h2 className="text-2xl font-bold">Step 4: Confirm Your Words</h2>
          <p className="text-sm text-gray-400 mb-4">
            To verify you wrote them down, enter the words from the positions below:
          </p>
          {confirmWords.map(({ index }, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-gray-300 mb-1">Word #{index + 1}:</p>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded"
                onChange={(e) =>
                  setUserInputs(prev => ({ ...prev, [index]: e.target.value }))
                }
              />
            </div>
          ))}
          {error && <p className="text-red-400 mt-2">{error}</p>}
          <button
            onClick={handleCheckWords}
            className="w-full py-2 mt-2 bg-purple-600 hover:bg-purple-700 rounded transition font-semibold"
          >
            Confirm
          </button>
        </>
      )}

      {step === 5 && (
        <>
          <h2 className="text-2xl font-bold">Step 5: Set Your Password</h2>
          <p className="text-sm text-gray-400 mb-2">
            Choose a strong password to protect your wallet locally.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="Choose a strong password"
          />
          <button
            onClick={handleComplete}
            className="w-full py-2 mt-4 bg-green-600 hover:bg-green-700 rounded transition font-semibold"
            disabled={!password}
          >
            🎉 Finish Setup
          </button>
        </>
      )}
    </div>
  )
}
