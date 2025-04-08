const express = require('express');
const router = express.Router();

const { createProject, updateProject, deleteProject, getProjectById, getAllProjects, getProjectsByOwner} = require('../controllers/projectController');

router.post('/createProject', createProject);
router.post('/updateProject/:projectId', updateProject);
router.delete('/deleteProject/:projectId', deleteProject);
router.get('/getProjectById/:projectId', getProjectById);
router.get('/getAllProjects', getAllProjects);
router.get('/getProjectsByOwner/:ownerId', getProjectsByOwner);


module.exports = router;