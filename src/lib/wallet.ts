import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import * as tinysecp from 'tiny-secp256k1'
import * as ECPairFactory from 'ecpair'
import BIP32Factory from 'bip32'
import QRCode from 'qrcode'

const ECPair = ECPairFactory.ECPairFactory(tinysecp)
const bip32 = BIP32Factory(tinysecp)

// Rede personalizada da Turion
const turionNetwork: bitcoin.Network = {
  messagePrefix: '\x19Turion Signed Message:\n',
  bech32: 'tur', // ✅ Gera tur1...
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x01, // Não usado em bech32, mas necessário para compatibilidade
  scriptHash: 0x05,
  wif: 0x9E, // ✅ Prefixo da WIF usado pela Turion (gera WIF tipo '7...')
}

export type WalletData = {
  mnemonic: string
  address: string
  privateKeyWIF: string
  qrCodeDataUrl: string
  balance: number
}

// Gera nova carteira com 12 palavras
export async function generateMnemonicWallet(): Promise<WalletData> {
  const mnemonic = bip39.generateMnemonic(128)
  return await restoreMnemonicWallet(mnemonic)
}

// Restaura carteira a partir de 12 palavras
export async function restoreMnemonicWallet(mnemonic: string): Promise<WalletData> {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root = bip32.fromSeed(seed, turionNetwork)
  const child = root.derivePath("m/44'/905'/0'/0/0")

  const keyPair = ECPair.fromPrivateKey(child.privateKey as Buffer, {
    network: turionNetwork,
  })

  const payment = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(keyPair.publicKey), // ✅ Corrigido para evitar erro ts(2740)
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
