const User = require('../models/User');
const bcrypt = require('bcrypt');

async function register(req, res) {

    try {
        const { name, email, password } = req.body;

        if(!name){
            return res.json({error:'Nom est obligatoire'});
        }

        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.json({ error: 'Email existe déjà' });
        }

        if(!password){
            return res.json({error: 'Mot de passe est obligatoire'});
        }

        if(!email){
            return res.json({ error: 'Email est obligatoire'});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.json({ error: 'Utilisateur enregistré avec succès'});

    } 
    
    catch (error) {
        res.json({error: 'error'});
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