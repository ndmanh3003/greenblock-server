import jwt from 'jsonwebtoken'
import { IAuth } from '../app/models'

export async function refreshTokens(account: IAuth) {
  const { _id, email, isVerified } = account

  if (!isVerified) throw new Error('Account not verified')

  const accessToken = jwt.sign({ _id, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '5h'
  })
  const refreshToken = jwt.sign({ _id, email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  })

  account.refreshToken = refreshToken
  await account.save()

  return { accessToken, refreshToken }
}
