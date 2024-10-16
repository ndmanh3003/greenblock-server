export interface IBigNumber {
  _hex: string
}

export interface IStatus {
  time: IBigNumber
  desc: string
  img: string[]
}

export function toNumber(num: IBigNumber) {
  return parseInt(num._hex)
}

export function toDate(timestamp: IBigNumber) {
  return new Date(toNumber(timestamp) * 1000)
}

export function toStatus(_status: IStatus) {
  return {
    time: toDate(_status.time),
    desc: _status.desc,
    img: _status.img
  }
}

export function toRecord(_record: { statuses: IStatus[]; isHarvested: boolean; statusCount: IBigNumber }) {
  const record = _record.statuses.map((s) => toStatus(s))
  return record
}

export function toInfo(_record: {
  isHarvested: boolean
  statusCount: IBigNumber
  updatedAt: IBigNumber
  createdAt: IBigNumber
}) {
  return {
    isHarvested: _record.isHarvested,
    statusCount: toNumber(_record.statusCount),
    updatedAt: toDate(_record.updatedAt),
    createdAt: toDate(_record.createdAt)
  }
}
