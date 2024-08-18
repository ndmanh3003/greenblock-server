/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
require('@nomiclabs/hardhat-ethers')

const { API_URL, PRIVATE_KEY } = process.env

module.exports = {
  solidity: '0.8.11',
  defaultNetwork: 'volta',
  networks: {
    hardhat: {},
    volta: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      gas: 210000000,
      gasPrice: 800000000000
    }
  }
}
