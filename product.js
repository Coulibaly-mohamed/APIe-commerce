import express from 'express'
import Product from '../models/Product.js'
import { verifyTokenAndAdmin } from '../middlewares/verifyToken.js'

const router = express.Router()

// Get the count of all products
router.get('/count', verifyTokenAndAdmin, async (req, res) => {
    try {
        const count = await Product.countDocuments()
        res.status(200).json({ count })
    } catch (err) {
        console.error(err)
        res.status(500).json({ response: 'Internal server error', err })
    }
})

// Get all products (with optional sorting)
router.get('/', async (req, res) => {
    const sortFields = req.query.sort ? req.query.sort.split(',') : []
    const limit = req.query.limit ? parseInt(req.query.limit) : 0 // Parse the limit value if any
    let query = Product.find()

    if (sortFields.length > 0) {
        const sortOptions = []

        sortFields.forEach(field => {
            let sortOrder = 1

            if (field.startsWith('-')) {
                sortOrder = -1
                field = field.substring(1) // Remove the minus sign from the field name
            }

            if (['title', 'price', 'desc', 'tag', 'img'].includes(field)) {
                sortOptions.push([field, sortOrder])
            }
        })

        if (sortOptions.length > 0) {
            query = query.sort(sortOptions)
        }
    }

    // Return the exact amount of products if limit is specified
    if (limit > 0) {
        query = query.limit(limit);
    }

    try {
        const data = await query.exec()
        res.status(200).json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({ response: 'Internal server error' })
    }
})

// Get a single product by id
router.get('/:id', (req, res) => {
    const id = req.params.id
    Product.findById(id)
        .then(data => {
            if (data) {
                res.status(200).json(data)
            } else {
                res.status(400).json({ response: `Could not find product with id ${id}` })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ response: 'Internal server error' })
        })
})

// Add a new product
router.post('/', verifyTokenAndAdmin, (req, res) => {
    const { title, desc, img, tag, price } = req.body
    const product = new Product({ title, desc, img, tag, price })

    product.save()
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ response: 'Internal server error' })
        })
})

// Add multiple products
router.post('/bulk', verifyTokenAndAdmin, (req, res) => {
    const products = req.body

    Product.insertMany(products)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ response: 'Internal server error', err })
        })
})

// Update a product
router.put('/:id', verifyTokenAndAdmin, (req, res) => {
    const id = req.params.id
    const { title, desc, img, tag, price } = req.body
    Product.findByIdAndUpdate(id, { title, desc, img, tag, price }, { new: true })
        .then(data => {
            if (data) {
                res.status(200).json(data)
            } else {
                res.status(400).json({ response: `Could not find product with id ${id}` })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ response: 'Internal server error' })
        })
})

// Delete a product
router.delete('/:id', verifyTokenAndAdmin, (req, res) => {
    const id = req.params.id
    Product.findByIdAndDelete(id)
        .then(data => {
            if (data) {
                res.status(200).json({ response: `Product with id ${id} has been deleted` })
            } else {
                res.status(400).json({ response: `Could not find product with id ${id}` })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ response: 'Internal server error' })
        })
})

// Delete all products
router.delete('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Product.deleteMany()
        res.status(200).json({ response: 'All products have been removed' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ response: 'Internal server error' })
    }
})

export default router
