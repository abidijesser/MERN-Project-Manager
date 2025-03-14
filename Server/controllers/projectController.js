const Project = require('../models/Project');

async function createProject(req, res) {

    try {
        const { projectName, description, owner } = req.body;

        if(!projectName){
            return res.json({error:'Le nom de projet est obligatoire'});
        }

        if (!description) {
            return res.json({ error: 'La description de projet est obligatoire' });
        }

        if(!owner){
            return res.json({error: 'owner invalid'});
        }

        const project = new Project({ 

            projectName, 
            description, 
            owner,
            status: "Active",
            startDate: new Date()
            // endDate: null
        });
        await project.save();

        res.json('Projet créé avec succès');
    } 
    
    catch (error) {
        res.json(error);
    }
}

module.exports = { createProject };
