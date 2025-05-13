import express from 'express'
import mongoose from 'mongoose'
import Cart from "../models/Cart.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import { verifyTokenAndAuthorization, verifyTokenAndAdmin } from "../middlewares/verifyToken.js"

const router = express.Router()

// Get all carts
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const carts = await Cart.find()
        res.status(200).json(carts)
    } catch (err) {
        res.status(500).json({ response: 'Internal server error' });
    }
})

// Get cart
router.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id)
        res.status(200).json(cart)
    } catch (err) {
        res.status(500).json({ response: 'Internal server error' })
    }
})

// Validate cart
const validateCart = async (userId, products) => {
    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId format')
    }

    // Check if the user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
        throw new Error('User does not exist')
    }

    // Validate the product IDs
    const invalidProductIds = products.filter(product => !mongoose.Types.ObjectId.isValid(product.productId))
    if (invalidProductIds.length > 0) {
        throw new Error('Invalid productId format')
    }

    // Check if the products exist
    const productIds = products.map(product => product.productId);
    const productsExist = await Product.find({ _id: { $in: productIds } })
    if (productsExist.length !== productIds.length) {
        throw new Error('Invalid productId format')
    }
}

// Create cart
router.post("/", async (req, res) => {
    const { userId, products } = req.body

    try {
        //await validateCart(userId, products)

        const newCart = new Cart({ userId, products })
        const savedCart = await newCart.save()
        res.status(200).json(savedCart)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Update cart
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    const { products } = req.body

    try {
        const cart = await Cart.findById(req.params.id)

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' })
        }

        await validateCart(cart.userId, products)

        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id,
            {
                $set: { products }
            },
            { new: true }
        )

        res.status(200).json(updatedCart)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Delete cart
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id)
        res.status(200).json("Cart has been deleted...")
    } catch (err) {
        res.status(500).json({ response: 'Internal server error' })
    }
})

export default router
