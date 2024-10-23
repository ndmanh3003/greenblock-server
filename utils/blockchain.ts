export interface IBigNumber {
  _hex: string
}

export interface IStatus {
  time: IBigNumber
  desc: string
  img: string[]
}

export interface IInfo {
  isHarvested: boolean
  statusCount: IBigNumber
  updatedAt: IBigNumber
  createdAt: IBigNumber
}

export interface IRecord {
  _statuses: IStatus[]
  isHarvested: boolean
  statusCount: IBigNumber
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

export function toRecord(record: IRecord) {
  return record._statuses.map((s) => toStatus(s))
}

export function toInfo(record: IInfo) {
  return {
    isHarvested: record.isHarvested,
    statusCount: toNumber(record.statusCount),
    updatedAt: toDate(record.updatedAt),
    createdAt: toDate(record.createdAt)
  }
}
