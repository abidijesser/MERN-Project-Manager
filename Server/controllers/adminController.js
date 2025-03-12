// const User = require('../models/User');

// async function gellAllusers(req, res) {
//     try {
//       const data = await User.find(); //await pour attendre la reponse de la base de donnees
//       res.status(200).send(data);
//     } catch (error) {
//       res.send('error');// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Server\controllers\adminController.js
const User = require('../models/User');

async function getAllUsers(req, res) {
    try {
        const data = await User.find(); // await to wait for the response from the database
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
};

module.exports = { getAllUsers };
//     }        
//   };


//   module.exports = { gellAllusers };