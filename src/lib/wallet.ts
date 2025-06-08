import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import * as tinysecp from 'tiny-secp256k1'
import * as ECPairFactory from 'ecpair'
import BIP32Factory from 'bip32'
import QRCode from 'qrcode'

const ECPair = ECPairFactory.ECPairFactory(tinysecp)
const bip32 = BIP32Factory(tinysecp)

const turionNetwork: bitcoin.Network = {
  messagePrefix: '\x19Turion Signed Message:\n',
  bech32: 'tur',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x1, // Prefixo "R"
  scriptHash: 0x05,
  wif: 0x80,
}

export type WalletData = {
  mnemonic: string
  address: string
  privateKeyWIF: string
  qrCodeDataUrl: string
  balance: number
}

export async function generateMnemonicWallet(): Promise<WalletData> {
  const mnemonic = bip39.generateMnemonic(128)
  return await restoreMnemonicWallet(mnemonic)
}

export async function restoreMnemonicWallet(mnemonic: string): Promise<WalletData> {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root = bip32.fromSeed(seed, turionNetwork)
  const child = root.derivePath("m/44'/905'/0'/0/0")

  const keyPair = ECPair.fromPrivateKey(child.privateKey as Buffer, {
    network: turionNetwork,
  })

  const payment = bitcoin.payments.p2pkh({
    pubkey: Buffer.from(keyPair.publicKey),
    network: turionNetwork,
  })

  if (!payment.address) {
    throw new Error('Failed to generate address')
  }

  const privateKeyWIF = keyPair.toWIF()
  const qrCodeDataUrl = await QRCode.toDataURL(payment.address)

  return {
    mnemonic,
    address: payment.address,
    privateKeyWIF,
    qrCodeDataUrl,
    balance: 0,
  }
}
