import axios from 'axios'

export const keepAlive = async () => {
  const callEnv = process.env.CALL
  const timeInterval = process.env.TIME_INTERVAL

  if (!callEnv || !timeInterval) return

  const urls = callEnv.split('/@/')

  const fetchUrls = async (urls: string[]) => {
    const promises = urls.map((url) => axios.get(url))
    await Promise.all(promises)
  }

  setInterval(
    () => {
      fetchUrls(urls).catch(() => {})
    },
    parseInt(timeInterval || '300000', 10)
  )
}
