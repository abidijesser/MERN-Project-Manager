const express = require('express');
const router = express.Router();

const { createProject, updateProject, deleteProject} = require('../controllers/projectController');

router.post('/createProject', createProject);
router.post('/updateProject/:projectId', updateProject);
router.delete('/deleteProject/:projectId', deleteProject);


module.exports = router;