import express from 'express'
import connectDB from './config/db'
import logger from './utils/logger'
import boom from '@hapi/boom'

require('dotenv').config()

const app = express()

// Connect database
connectDB()

// Init middlewares
app.use(express.urlencoded({ extended: false }))
app.use(express.json({ extended: false }))

app.get('/', (req, res) => {
  res.send(`Server is up on port ${PORT}`)
})

// Boom error handling middleware
app.use((err, req, res, next) => {
  if (err.isBoom) {
    // Log the error
    logger.error(err.output.payload.message)
    res.status(err.output.statusCode).json(err.output.payload)
  } else {
    logger.error(err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is up at http://localhost:${PORT}`)
})

export default app
