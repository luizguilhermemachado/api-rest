import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { db } from '../database'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    await db.destroy()
  })

  beforeEach(async () => {
    await db.migrate.rollback(undefined, true) // desfaz todas as migrations
    await db.migrate.latest() // aplica de novo
  })

  it('user can create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)
      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        }),
      ])
    }
  })

  it('should be able to to get a specific transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      const transactionId = listTransactionsResponse.body.transactions[0].id

      const getTransactionResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)
        .expect(200)

      expect(getTransactionResponse.body.transaction).toEqual(
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        }),
      )
    }
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })

    if (cookies) {
      const sumaryResponse = await request(app.server)
        .get('/transactions/sumary')
        .set('Cookie', cookies)
        .expect(200)
      expect(sumaryResponse.body.sumary).toEqual(
        expect.objectContaining({
          amount: 5000,
        }),
      )
    }
  })
})
