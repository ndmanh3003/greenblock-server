// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hre = require('hardhat')

async function main() {
  const HistoryApi = await hre.ethers.getContractFactory('HistoryApi')
  const HistoryApi_ = await HistoryApi.deploy()

  await HistoryApi_.deployed()

  console.log(`Contract Address:  ${HistoryApi_.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
