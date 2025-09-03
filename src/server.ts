import { app } from './app'
import { env } from './env'

// Pega a porta do Render ou do .env
const port = Number(process.env.PORT) || env.PORT

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`🚀 Server running on port ${port}`)
})
