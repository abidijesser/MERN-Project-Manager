const User = require('../models/User');

async function getAllUsers(req, res) {
    try {
        const users = await User.find().select('-password'); // Exclure le mot de passe
        if (!users) {
            return res.status(404).json({
                success: false,
                error: 'Aucun utilisateur trouvé'
            });
        }
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des utilisateurs'
        });
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de l\'utilisateur'
        });
    }
}

async function updateUserById(req, res) {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in updateUserById:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de l\'utilisateur'
        });
    }
}

module.exports = { getAllUsers, getUserById, updateUserById };
