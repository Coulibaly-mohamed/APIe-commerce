import jwt from 'jsonwebtoken'
// import mongoose from 'mongoose'
// import Cart from "../models/Cart.js";

// Méthode de contrôle de validité d'un token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
        const token = authHeader.split(" ")[1]
        
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) res.status(403).json("Token is not valid!")
            req.user = user
            next()
        })
    } else {
        return res.status(401).json("You are not authenticated!")
    }
}

// Niveau d'autorisation 'utilisateur'. Ne peut modifier que ses propres ressources
const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, async () => {
        try {
            let authorized = false;
            // const cartId = req.params.id;

            // Verify if the cartId is a valid ObjectId
            // if (!mongoose.Types.ObjectId.isValid(cartId)) {
            //     return res.status(400).json("Invalid cart ID!");
            // }

            // Verify if the cart exists
            // const cart = await Cart.findById(req.params.id)

            // if (!cart) {
            //     return res.status(404).json("Cart not found!");
            // }

            // Verify if the user is authorized to access resource (product, cart, user, etc.)
            if (req.user.isAdmin) {
                authorized = true
            } else if (req.params.id) {
                if (req.params.id === req.user.id) {
                    authorized = true
                } 
                // else if (cart && cart.userId.toString() === req.user.id) {
                //     authorized = true
                // }
            }

            if (authorized) {
                next()
            } else {
                res.status(403).json("You are not allowed to do that!")
            }
        } catch (err) {
            res.status(500).json({ response: 'Internal server error: ' + err.message })
        }
    })
}

// Niveau d'autorisation 'admin', possède tous les droits sur l'application
const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next()
        } else {
            res.status(403).json("You are not allowed to do that!")
        }
    })
}

export {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
}
