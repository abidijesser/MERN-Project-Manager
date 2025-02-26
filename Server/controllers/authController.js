const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
            return res.json('Email non trouvé');
        }
        
        const isMatched = await bcrypt.compare(password, user.password);

        if (isMatched) {
            jwt.sign({
                email: user.email, id: user._id, name: user.name}, 
                process.env.JWT_SECRET, 
                {}, 
                (err, token) =>{
                    if(err) throw error;
                    res.cookie('token', token).json(user)
                }
            )
        }
        else{
            return res.json('Mot de passe incorrect');
        }
       
        // res.status(200).json({success: true, message: 'Connexion réussie'});
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur interne du serveur');
    }
}

const getProfile =(req, res) => {
    const {token} = req.cookies
    if(token){
        jwt.verify(token, process.env.JWT_SECRET,{}, (err, user) => {
            if(err) throw err;
            res.json(user);
        });
    } else {
        res.json(null);
    }
}



module.exports = { register, login, getProfile };