const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const auth = require("../middleware/auth");

// Appliquer le middleware d'authentification à toutes les routes
router.use(auth);

// Routes CRUD
router.post("/", meetingController.createMeeting);
router.get("/", meetingController.getAllMeetings);
router.get("/upcoming", meetingController.getUpcomingMeetings);
router.get("/:id", meetingController.getMeetingById);
router.put("/:id", meetingController.updateMeeting);
router.delete("/:id", meetingController.deleteMeeting);

module.exports = router;
