const API_URL = process.env.API_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const contractAddress = process.env.CONTRACT_ADDRESS

import { ethers } from 'ethers'
const provider = new ethers.providers.JsonRpcProvider(API_URL)
const signer = new ethers.Wallet(PRIVATE_KEY, provider)

import { abi } from '../artifacts/contracts/HistoryApi.sol/HistoryApi.json'
export const contractInstance = new ethers.Contract(contractAddress, abi, signer)
