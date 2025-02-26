const User = require('../models/User');
const bcrypt = require('bcrypt');

async function register(req, res) {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(200).send('Utilisateur enregistré avec succès');
    } catch (error) {
        res.status(400).send('error');
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Email non trouvé');
        }
        
        const isMatched = bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).send('Mot de passe incorrect');
        }
       
        res.status(200).send('Connexion réussie');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur interne du serveur');
    }
}

module.exports = { register, login };