import express from 'express'
import User from '../models/User.js'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body

    try {
        const iv = randomBytes(16)
        const cipher = createCipheriv('aes-256-cbc', process.env.PASS_SEC, iv)
        let encryptedPassword = cipher.update(password, 'utf8', 'hex')
        encryptedPassword += cipher.final('hex')

        const newUser = new User({
            username,
            email,
            password: encryptedPassword,
            iv: iv.toString('hex')
        })

        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (err) {
        res.status(500).json({ response: 'Internal server error: ' + err.message })
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username: username })

        if (!user) {
            return res.status(401).json('Wrong User Name')
        }

        const decipher = createDecipheriv(
            'aes-256-cbc',
            process.env.PASS_SEC,
            Buffer.from(user.iv, 'hex')
        )

        let decryptedPassword = decipher.update(user.password, 'hex', 'utf8')
        decryptedPassword += decipher.final('utf8')

        if (decryptedPassword !== password) {
            return res.status(401).json('Wrong Password')
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SEC,
            { expiresIn: '3d' }
        )
        
        // On exclut le mot de passe de l'objet utilisateur pour ne pas l'envoyer au client
        const { password: _, ...others } = user._doc

        // On renvoie l'utilisateur sans le mot de passe et le token d'accès
        res.status(200).json({ ...others, accessToken })
    } catch (err) {
        res.status(500).json({ response: 'Internal server error' })
    }
})

export default router
