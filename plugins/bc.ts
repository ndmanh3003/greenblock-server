require('dotenv').config()
const API_URL = process.env.API_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const contractAddress = process.env.CONTRACT_ADDRESS

const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider(API_URL)
const signer = new ethers.Wallet(PRIVATE_KEY, provider)
const { abi } = require('../artifacts/contracts/HistoryApi.sol/HistoryApi.json')
const contractInstance = new ethers.Contract(contractAddress, abi, signer)

module.exports = contractInstance
