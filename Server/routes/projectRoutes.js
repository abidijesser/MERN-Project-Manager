const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const projectController = require("../controllers/projectController");
const Project = require("../models/Project");
const Task = require("../models/Task");

// GET all projects
router.get("/", auth, async (req, res) => {
  try {
    // Récupérer tous les projets sans filtrer par propriétaire
    let projects = await Project.find()
      .populate({
        path: "tasks",
        model: "Task",
        select: "title description status priority dueDate",
      })
      .populate("members")
      .populate("owner");

    // For each project, find all tasks that reference this project
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];

      // If the project has no tasks or empty tasks array, find tasks that reference this project
      if (!project.tasks || project.tasks.length === 0) {
        console.log(
          `Project ${project.projectName} has no tasks in its tasks array. Finding tasks that reference this project...`
        );

        const tasksForProject = await Task.find({
          project: project._id,
        }).select("title description status priority dueDate");

        console.log(
          `Found ${tasksForProject.length} tasks for project ${project.projectName}`
        );

        // Update the project's tasks array with these tasks
        if (tasksForProject.length > 0) {
          await Project.findByIdAndUpdate(project._id, {
            $set: { tasks: tasksForProject.map((task) => task._id) },
          });

          // Update the project in our results
          project.tasks = tasksForProject;
          console.log(
            `Updated project ${project.projectName} with ${tasksForProject.length} tasks`
          );
        }
      }
    }

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des projets",
    });
  }
});

// GET a single project by ID
router.get("/:id", auth, projectController.getProjectById);

// POST create a new project
router.post("/", auth, projectController.createProject);

// POST add comment to project
router.post("/:id/comments", auth, projectController.addComment);

// PUT update an existing project
router.put("/:id", auth, projectController.updateProject);

// DELETE a project
router.delete("/:id", auth, projectController.deleteProject);

// GET project members
router.get("/:id/members", projectController.getProjectMembers);

module.exports = router;
