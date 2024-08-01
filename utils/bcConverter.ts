export interface IBigNumber {
  _hex: string
}

export interface IStatus {
  0: IBigNumber
  1: string
  2: string[]
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

export function toRecord(_record: { 0: IStatus[]; 1: boolean; 2: IBigNumber }) {
  const record = _record[0].map((s) => toStatus(s))
  return record
}
