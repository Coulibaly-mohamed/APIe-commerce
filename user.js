import express from 'express'
import User from '../models/User.js'
import { verifyTokenAndAuthorization, verifyTokenAndAdmin } from '../middlewares/verifyToken.js'

const router = express.Router()

// Get all users
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (error) {
        console.error('Error getting users:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get a specific user by ID
router.get('/:id', verifyTokenAndAuthorization, async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json(user)
    } catch (error) {
        console.error('Error getting user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create a new user
// router.post('/', async (req, res) => {
//     const { username, email, password } = req.body

//     try {
//         const newUser = await User.create({ username, email, password })
//         res.status(201).json(newUser)
//     } catch (error) {
//         console.error('Error creating user:', error)
//         res.status(500).json({ error: 'Internal server error' })
//     }
// })

// Update a user
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
    const { id } = req.params
    const { username, email, password } = req.body

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username, email, password },
            { new: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json(updatedUser)
    } catch (error) {
        console.error('Error updating user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
  
      // Comparer le mot de passe haché
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
  
      // Créer le token JWT
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET, // définie dans .env
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Connexion réussie', token });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  

// Set or unset a user as admin
router.put('/:id/admin', async (req, res) => {
    const { id } = req.params
    const { isAdmin } = req.body

    try {
        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        user.isAdmin = isAdmin
        await user.save()
        res.status(200).json(user)
    } catch (error) {
        console.error('Error updating user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete a user
router.delete('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const deletedUser = await User.findByIdAndDelete(id)

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
