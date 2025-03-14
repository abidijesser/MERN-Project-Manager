const Project = require('../models/Project');
const User = require('../models/User');

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

        const ownerExists = await User.findById(owner);
        if (!ownerExists) {
            return res.json({ error: "L'utilisateur spécifié comme propriétaire n'existe pas" });
        }

        const project = new Project({ 

            projectName, 
            description, 
            owner,
            status: "Active",
            startDate: new Date(),
            endDate: null
        });
        await project.save();
        await User.findByIdAndUpdate(owner, { $push: { projects: project._id } });

        res.json('Projet créé avec succès');
    } 
    
    catch (error) {
        res.json(error);
    }
};


const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log("Params:", req.params);

        const { projectName, description, status } = req.body;

        if (!projectId) {
            return res.json({ error: 'ID du projet requis' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { projectName, description, status },
            { new: true } 
        );

        if (!updatedProject) {
            return res.json({ error: 'Projet non trouvé' });
        }

        res.json({ message: 'Projet mis à jour avec succès', updatedProject });
    } catch (error) {
        res.json(error);
    }
};


module.exports = { createProject, updateProject };
