import {defineField} from 'sanity'
import {LexoRank} from 'lexorank'

const CONTENT_TYPES = ['project', 'post']
const API_VERSION = '2025-06-27'

const getNextRank = (value?: string) => {
  try {
    return (value ? LexoRank.parse(value) : LexoRank.min()).genNext().genNext().toString()
  } catch {
    return LexoRank.min().genNext().genNext().toString()
  }
}

export const sharedOrderRankField = () =>
  defineField({
    name: 'orderRank',
    title: 'Order Rank',
    type: 'string',
    hidden: true,
    readOnly: true,
    initialValue: async (_, {getClient}) => {
      const lastRank = await getClient({apiVersion: API_VERSION}).fetch(
        '*[_type in $types] | order(orderRank desc)[0].orderRank',
        {types: CONTENT_TYPES},
      )

      return getNextRank(lastRank)
    },
  })
