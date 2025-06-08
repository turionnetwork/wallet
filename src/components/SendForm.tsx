'use client'

import { FC, useState, useRef } from 'react'
import priceData from '@/lib/price.json'
import { Html5Qrcode } from 'html5-qrcode'

type Props = {
  onCancel: () => void
  onConfirm: (data: {
    amountTUR: number
    toAddress: string
    message?: string
  }) => void
  balance: number // saldo da carteira Turion
}

export const SendForm: FC<Props> = ({ onCancel, onConfirm, balance }) => {
  const [amountTUR, setAmountTUR] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [message, setMessage] = useState('')
  const [scanning, setScanning] = useState(false)
  const qrRegionRef = useRef<HTMLDivElement>(null)

  const turPrice = priceData.turPriceUsd
  const amount = parseFloat(amountTUR)
  const isAmountValid = !isNaN(amount) && amount > 0 && amount <= balance
  const usdValue = (amount * turPrice).toFixed(2)

  const handleSubmit = () => {
    if (!isAmountValid || !toAddress) {
      alert('Please fill in all required fields.')
      return
    }

    onConfirm({ amountTUR: amount, toAddress, message })
  }

  const startScanner = async () => {
    if (!qrRegionRef.current) return

    const scanner = new Html5Qrcode(qrRegionRef.current.id)
    setScanning(true)

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setToAddress(decodedText)
          scanner.stop()
          setScanning(false)
        },
        (error) => {
          console.warn('QR scan error', error)
        }
      )
    } catch (err) {
      console.error('QR scanner failed:', err)
      setScanning(false)
    }
  }

  return (
    <div className="bg-[#1e1e2f] p-6 rounded-xl shadow-xl text-white space-y-6">
      <h2 className="text-xl font-bold text-center text-purple-400">Send TUR</h2>

      {/* Amount in TUR */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Amount (TUR)</label>
        <input
          type="number"
          value={amountTUR}
          onChange={(e) => setAmountTUR(e.target.value)}
          placeholder="0.00"
          className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
        />
        {amountTUR && (
          <p className="text-right text-green-400 text-sm mt-1">
            ≈ ${usdValue} USD
          </p>
        )}
        {!isAmountValid && amountTUR && (
          <p className="text-right text-red-400 text-xs mt-1">
            Amount exceeds your balance ({balance} TUR)
          </p>
        )}
      </div>

      {/* Recipient address */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Recipient address</label>
        <div className="flex">
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="Paste or scan address"
            className="flex-1 p-2 rounded-l-md bg-gray-800 border border-gray-700 focus:outline-none"
          />
          <button
            onClick={startScanner}
            className="px-3 bg-gray-700 rounded-r-md hover:bg-gray-600 transition"
            title="Scan QR Code"
          >
            📷
          </button>
        </div>
      </div>

      {/* QR Scanner region */}
      {scanning && (
        <div className="border border-gray-600 rounded-md p-2 mt-2">
          <div id="qr-reader" ref={qrRegionRef} className="w-full h-64" />
          <p className="text-xs text-center mt-2 text-gray-400">
            Scanning... point your camera at a QR Code
          </p>
        </div>
      )}

      {/* Optional message */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Message (optional)</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center pt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-semibold transition"
        >
          ❌ Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isAmountValid || !toAddress}
          className={`px-5 py-2 rounded-md font-semibold transition ${
            isAmountValid && toAddress
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          ✅ Confirm
        </button>
      </div>
    </div>
  )
}
