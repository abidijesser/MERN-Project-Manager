const User = require('../models/User');
 
 async function getAllUsers(req, res) {
     try {
         const data = await User.find(); 
         res.status(200).send(data);
     } catch (error) {
         res.status(500).send('Error fetching users');
     }
 };
 
 module.exports = { getAllUsers };