
const User = require('../models/User');

async function getAllUsers(req, res) {
    try {
        const data = await User.find(); // await to wait for the response from the database
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
};
async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
};
async function updateUserById(req, res) {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send('Error updating user');
    }
};

module.exports = { getAllUsers, getUserById, updateUserById };
