const User = require('../models/User');

async function addUser(req, res) {
    try {
        const data = new User(req.body);
        await data.save();
        res.status(200).send('data inserted');
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

        
        if (user.password !== password) {
            return res.status(400).send('Mot de passe incorrect');
        }

        
        res.status(200).send('Connexion réussie');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur interne du serveur');
    }
}

module.exports = { addUser, login };