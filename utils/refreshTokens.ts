const { IAuth } = require('../app/models/Auth')
require('dotenv').config()
const jwt = require('jsonwebtoken')

interface ITokenAuth {
  save: () => Promise<void>
}

export default async function refreshTokens(account: typeof IAuth & ITokenAuth) {
  const { _id, email } = account

  const accessToken = jwt.sign({ _id, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '10h'
  })
  const refreshToken = jwt.sign({ _id, email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  })

  account.refreshToken = refreshToken
  await account.save()

  return { accessToken, refreshToken }
}
