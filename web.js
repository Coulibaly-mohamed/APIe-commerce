import cors from 'cors'
import http from 'http'
import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json' with { type: 'json' }
import productRoutes from './routes/product.js'
import userRoutes from './routes/user.js'
import authRoutes from './routes/auth.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/order.js'

const app = express()
const PORT = 8080

const server = http.createServer(app)

config()

// Connect to the MongoDB database
mongoose
    .connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
    .then(() => {
        console.log('Connected to the database')
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error)
    })

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/checkout', orderRoutes)

// Serve static files from the "public" directory
app.use(express.static('public'))

app.use((req, res) => {
    res.status(404).json({ message: `API not found at ${req.url}` })
})

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}. API Documentation: http://localhost:${PORT}/api-docs/`)
})

// export default app
