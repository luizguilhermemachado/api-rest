import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../database'
import { randomUUID } from 'crypto'

import { checkSessionIdExists } from '../middleware/check-session-id'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/sumary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const sessionId = req.cookies.sessionId

      const sumary = await db('transactions')
        .where('session_id', sessionId)
        .sum('amount', {
          as: 'amount',
        })
        .first()

      return { sumary }
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const sessionId = req.cookies.sessionId

      const transactions = await db('transactions')
        .where('session_id', sessionId)
        .select()

      return {
        transactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const sessionId = req.cookies.sessionId

      const getTransactionParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getTransactionParamsSchema.parse(req.params)

      const transaction = await db('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return { transaction }
    },
  )

  app.post('/', async (req, reply) => {
    const createTrasactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTrasactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days,
      })
    }

    await db('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
