import axios from 'axios'

export const keepAlive = async () => {
  const callEnv = process.env.CALL
  if (!callEnv) return

  const urls = callEnv.split('/@/')

  const fetchUrls = async (urls: string[]) => {
    for (const url of urls) {
      console.log(`Calling: ${url}`)
      try {
        const response = await axios.get(url)
        console.log(`URL ${url} was successfully called. Status: ${response.status}`)
      } catch (error) {
        console.log(`URL ${url} encountered an error: ${error}`)
      }
    }
  }

  setInterval(
    () => {
      fetchUrls(urls).catch(() => {})
    },
    parseInt(process.env.timeInterval || '300000', 10)
  )
}
