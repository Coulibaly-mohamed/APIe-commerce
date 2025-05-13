import express from "express"
import Order from "../models/Order.js"
import { verifyTokenAndAdmin } from "../middlewares/verifyToken.js"

const router = express.Router()

/* @Todo: . Get related user, carts and products
          . Calculate amount (check product prices and quantities)
          . Use third party payment gateway
*/

// Get all orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ error: "Failed to get orders" })
    }
})

// Create a new order (checkout)
router.post("/", async (req, res) => {
    try {
        const { userId, cartId } = req.body
        const order = new Order({ userId, cartId })
        const savedOrder = await order.save()
        res.status(201).json(savedOrder)
    } catch (error) {
        res.status(500).json({ error: "Failed to create order" })
    }
})

// Delete an order (payment)
router.delete("/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params
        await Order.findByIdAndDelete(orderId)
        res.status(200).json({ message: "Order deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order" })
    }
})

export default router
