const { toAccount, toDate, toStatus } = require('./bcConverter')
const contractInstance = require('../plugins/bc')

const _type = ['planting', 'harvested', 'inspected', 'exported']

export async function getDetail(index: number) {
  const product = await contractInstance.getProduct(index)
  const type = await contractInstance.getType(index)
  const history = []
  for (let i = 0; i < product[6].length; i++) {
    history.push(toStatus(product[6][i]))
  }

  const result = {
    id: index,
    business: toAccount(product[0]),
    inspector: toAccount(product[1]),
    name: product[2],
    variety: product[3],
    location: product[4],
    plantAt: toDate(product[5]),
    history: history,
    harvest: toStatus(product[8]),
    export: toStatus(product[9]),
    imgCert: product[10],
    desc: product[11],
    type: _type[type]
  }

  return result
}
