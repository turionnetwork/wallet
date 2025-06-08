'use client'

import type { FC } from 'react'
import { useState } from 'react'
import * as bip39 from 'bip39'
import BIP32Factory from 'bip32'
import * as bitcoin from 'bitcoinjs-lib'
import * as tinysecp from 'tiny-secp256k1'
import * as ECPairFactory from 'ecpair'
import QRCode from 'qrcode'

const bip32 = BIP32Factory(tinysecp)
const ECPair = ECPairFactory.ECPairFactory(tinysecp)

const turionNetwork: bitcoin.Network = {
  messagePrefix: '\x19Turion Signed Message:\n',
  bech32: 'tur',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x1,
  scriptHash: 0x05,
  wif: 0x80,
}

type Wallet = {
  mnemonic: string
  address: string
  privateKeyWIF: string
  qrCodeDataUrl: string
  balance: number
}

type Props = {
  onRestore: (wallet: Wallet) => void
  onBack: () => void
}

export const WalletForm: FC<Props> = ({ onRestore, onBack }) => {
  const [mnemonic, setMnemonic] = useState('')

  const handleRestore = async () => {
    const phrase = mnemonic.trim().toLowerCase()
    if (!bip39.validateMnemonic(phrase)) {
      alert('Invalid seed phrase.')
      return
    }

    const seed = await bip39.mnemonicToSeed(phrase)
    const root = bip32.fromSeed(seed, turionNetwork)
    const child = root.derivePath("m/44'/1'/0'/0/0")
    const keyPair = ECPair.fromPrivateKey(child.privateKey!, { network: turionNetwork })

    const { address } = bitcoin.payments.p2pkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network: turionNetwork,
    }) as { address: string }

    const privateKeyWIF = keyPair.toWIF()
    const qrCodeDataUrl = await QRCode.toDataURL(address)

    const wallet: Wallet = {
      mnemonic: phrase,
      address,
      privateKeyWIF,
      qrCodeDataUrl,
      balance: 0,
    }

    onRestore(wallet)
  }

  return (
    <div className="space-y-4">
      <textarea
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        rows={3}
        className="w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-xl shadow-inner placeholder-gray-400 text-sm"
        placeholder="ex: flame rocket mirror curve ..."
      />
      <button
        onClick={handleRestore}
        className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition"
      >
        🔓 Connect
      </button>
      <button
        onClick={onBack}
        className="w-full py-3 bg-gray-600 text-white rounded-xl shadow hover:bg-gray-500 transition"
      >
        ⬅ Back
      </button>
    </div>
  )
}
