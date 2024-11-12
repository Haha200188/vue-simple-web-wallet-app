<script setup>
import * as bip39 from "bip39"
import { hdkey } from "ethereumjs-wallet"
import { ref } from 'vue'
import { showNotify } from 'vant'
import 'vant/lib/index.css'
import store2 from "store2" // store and get object from localstorage without type conversion(object <-> string) 

// One wallet can have multiple accounts *

const showLoginDialog = ref(false) // to control login dialog show or not
const showMnemonicDialog = ref(false) // to control mnemonic dialog show or not
const showMnemonic = ref(false)  // to control mnemonic part show or not
const password = ref('')
const mnemonic = ref('') // ref object is a responsive object
const mnemonicToConfirm = ref('') // the mnemonic inputed by user, for checking

const createWallet = () => {
  showLoginDialog.value = true
}
const confirmPsw = () => {
  if (password.value === "") {
    showNotify({ type: 'danger', message: 'Input your password.' })
  } else {
    const storeWallet = store2.get("walletInfo") // get walletInfo from localstorage
    if (storeWallet) {
      mnemonic.value = storeWallet[0]["mnemonic"] // set mnemonic from localstorage
      confirmMnemonic()
    } else {
      mnemonic.value = bip39.generateMnemonic() // generate new mnemonic
      showMnemonic.value = true
    }

  }
}
const confirmSavedMnemonic = () => {
  showMnemonicDialog.value = true
}

const confirmMnemonic = async () => {
  showMnemonic.value = false
  const storeWallet = store2.get("walletInfo") || [] // get walletInfo from localstorage
  if (!storeWallet && mnemonic.value !== mnemonicToConfirm.value) {
    showNotify({ type: 'danger', message: 'Mnemonic input not correct.' })
  } else {
    const seed = await bip39.mnemonicToSeed(mnemonic.value) // create seed by mnemonic
    const hdWallet = hdkey.fromMasterSeed(seed) // using seed to create HD wallet by hdkey
    const addressIndex = storeWallet.length === 0 ? 0 : storeWallet.length // set account address index
    const keyPair = hdWallet.derivePath(`m/44'/60'/0'/0/${addressIndex}`) // get key pair
    const wallet = keyPair.getWallet() // get wallet object
    const lowerCaseAddress = wallet.getAddressString() // get address of wallet
    const CheckSumAddress = wallet.getChecksumAddressString() // get check sum address of wallet 
    const prikey = wallet.getPrivateKey().toString("hex") // get private key
    const keystore = await wallet.toV3(password.value)
    const walletObj = {
      id: addressIndex,
      address: addressIndex,
      prikey,
      keystore,
      mnemonic: mnemonic.value,
      balance: 0
    }
    storeWallet.push(walletObj)
    store2("walletInfo", storeWallet) // to update the array(walletInfo) by old array(storeWallet) and new obj(walletObj)
  }
}
</script>

<template>
  <van-space>
    <van-button type="primary" @click="createWallet">Create Wallet</van-button>
    <van-button type="primary">Import Wallet</van-button>

    <van-dialog
      v-model:show="showLoginDialog"
      title="Create Wallet"
      show-cancel-button
      @confirm="confirmPsw"
    >
      <van-cell-group inset>
        <van-field
          v-model="password"
          label="password"
          placeholder="Input your password"
          type="password"
        />
      </van-cell-group>
    </van-dialog>
  </van-space>
  <template v-if="showMnemonic">
    <p>{{ mnemonic }}</p>
    <van-button size="mini" @click="confirmSavedMnemonic"
      >Mnemonic Saved</van-button
    >
    <van-dialog
      v-model:show="showMnemonicDialog"
      title="Confirm mnemonic"
      show-cancel-button
      @confirm="confirmMnemonic"
    >
      <van-cell-group inset>
        <van-field
          v-model="mnemonicToConfirm"
          label="mnemonic"
          placeholder="Input your mnemonic"
        />
      </van-cell-group>
    </van-dialog>
  </template>
</template>

<style lang="less">
p {
  user-select: all;
}
</style>