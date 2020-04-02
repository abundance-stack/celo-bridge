require('dotenv').config()

const DAI_ADDRESS = '0x48b0c1d90c3058ab032c44ec52d98633587ee711' // MOON

const ethers = require('ethers')
const Kit = require('@celo/contractkit')
const Web3 = require('web3')

const wallets = require('../config/wallets')

let web3 = new Web3()
let account = new ethers.Wallet(process.env.CELO_PRIVATE_KEY)
const kit = new Kit.newKit('https://alfajores-forno.celo-testnet.org')
kit.addAccount(account.privateKey)

const main = async () => {
  const dai = new ethers.Contract(
    DAI_ADDRESS,
    [
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'function transfer(address to, uint amount)',
      'function symbol() view returns (string)'
    ],
    ethers.getDefaultProvider('ropsten')
  )

  const symbol = await dai.symbol()

  const cUSD = await kit.contracts.getStableToken()

  for (let i = 0; i < wallets.length; i++) {
    const projectId = Object.keys(wallets[i])[0]
    const addresses = wallets[i][projectId]
    const ethAddr = addresses.ethereum
    const celoAddr = addresses.celo

    if (ethAddr && celoAddr) {
      console.log(`Watching ethereum address ${ethAddr}\n`)
      let filter = dai.filters.Transfer(null, ethAddr)

      dai.on(filter, async (from, to, value, event) => {
        let amount = ethers.utils.formatEther(value)
        console.log(`\n⬇️  Received ${amount} ${symbol} from ${from} to ${to}`)
        console.log(`\n⬆️  Sending ${amount} cUSD to ${celoAddr}`)

        const tx = await cUSD
          .transfer(celoAddr, value.toString())
          .send({ from: account.address })

        const txHash = await tx.hashFuture.promise
        console.log(
          `    https://alfajores-blockscout.celo-testnet.org/tx/${txHash}`
        )
        await tx.waitReceipt()
      })
    }
  }
}

main()
