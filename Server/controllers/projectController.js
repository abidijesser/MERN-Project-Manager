const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res) => {

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


const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.json({ error: 'ID du projet requis' });
        }

        const deletedProject = await Project.findByIdAndDelete(projectId);

        if (!deletedProject) {
            return res.json({ error: 'Projet non trouvé' });
        }

        res.json({ message: 'Projet supprimé avec succès' });
    } catch (error) {
        res.json(error);
    }
};


const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params; 

        if (!projectId) {
            return res.json({ error: 'ID du projet requis' });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.json({ error: 'Projet non trouvé' });
        }

        res.json(project); 
    } catch (error) {
        res.json(error);
    }
};

const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects); 
    } catch (error) {
        res.json(error);
    }
};

const getProjectsByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;

        if (!ownerId) {
            return res.json({ error: "ID du propriétaire requis" });
        }

        const projects = await Project.find({ owner: ownerId });

        res.json(projects);
    } catch (error) {
        res.json(error);
    }
};



module.exports = { createProject, updateProject, deleteProject, getProjectById, getAllProjects, getProjectsByOwner };
