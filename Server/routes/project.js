const express = require('express');
const router = express.Router();

const { createProject, updateProject } = require('../controllers/projectController');

router.post('/createProject', createProject);
router.post('/updateProject/:projectId', updateProject);


module.exports = router;