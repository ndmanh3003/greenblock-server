export interface IBigNumber {
  _hex: string
}

interface I_Status {
  0: IBigNumber
  1: string
  2: string[]
}

interface I_Account {
  0: string
  1: string
}

export function toNumber(num: IBigNumber) {
  return parseInt(num._hex)
}

export function toDate(timestamp: IBigNumber) {
  return new Date(parseInt(timestamp._hex) * 1000).toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh'
  })
}

export function toStatus(_status: I_Status) {
  return {
    time: toDate(_status[0]),
    desc: _status[1],
    img: _status[2]
  }
}

export function toAccount(_account: I_Account) {
  return {
    id: _account[0],
    name: _account[1]
  }
}
