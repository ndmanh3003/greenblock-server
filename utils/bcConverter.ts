export interface IBigNumber {
  _hex: string
}

export interface IStatus {
  0: IBigNumber
  1: string
  2: string[]
}

interface IAccount {
  0: string
  1: string
}

export function toNumber(num: IBigNumber) {
  return parseInt(num._hex)
}

export function toDate(timestamp: IBigNumber) {
  return new Date(toNumber(timestamp) * 1000)
}

export function toStatus(_status: IStatus) {
  return {
    time: toDate(_status[0]),
    desc: _status[1],
    img: _status[2]
  }
}

export function toAccount(_account: IAccount) {
  return {
    id: _account[0],
    name: _account[1]
  }
}
