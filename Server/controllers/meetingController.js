const Meeting = require("../models/Meeting");
const { isValidObjectId } = require("mongoose");

// Créer une nouvelle réunion
const createMeeting = async (req, res) => {
  try {
    const { title, date, participants, meetingLink, googleCalendarEventId } = req.body;

    // Validation de base
    if (!date || !participants || !meetingLink) {
      return res.status(400).json({
        success: false,
        error: "Veuillez fournir la date, les participants et le lien de la réunion",
      });
    }

    // Calculer la date de fin (1 heure après le début par défaut)
    const endDate = new Date(new Date(date).getTime() + 60 * 60 * 1000);

    // Créer la nouvelle réunion
    const meeting = new Meeting({
      title: title || "Réunion",
      date,
      endDate,
      participants: Array.isArray(participants) ? participants : participants.split(",").map(email => email.trim()),
      meetingLink,
      organizer: req.user.id,
      googleCalendarEventId,
    });

    await meeting.save();

    res.status(201).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la réunion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la réunion",
    });
  }
};

// Récupérer toutes les réunions
const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("organizer", "name email")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réunions:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des réunions",
    });
  }
};

// Récupérer les prochaines réunions
const getUpcomingMeetings = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Récupérer les réunions dont la date est supérieure ou égale à la date actuelle
    const meetings = await Meeting.find({ date: { $gte: new Date() } })
      .populate("organizer", "name email")
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des prochaines réunions:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des prochaines réunions",
    });
  }
};

// Récupérer une réunion par ID
const getMeetingById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID de réunion invalide",
      });
    }

    const meeting = await Meeting.findById(req.params.id)
      .populate("organizer", "name email");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: "Réunion non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la réunion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de la réunion",
    });
  }
};

// Mettre à jour une réunion
const updateMeeting = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID de réunion invalide",
      });
    }

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: "Réunion non trouvée",
      });
    }

    // Vérifier si l'utilisateur est l'organisateur de la réunion
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier cette réunion",
      });
    }

    const { title, date, participants, meetingLink, googleCalendarEventId } = req.body;

    // Mettre à jour les champs
    if (title) meeting.title = title;
    if (date) {
      meeting.date = date;
      // Mettre à jour la date de fin (1 heure après le début par défaut)
      meeting.endDate = new Date(new Date(date).getTime() + 60 * 60 * 1000);
    }
    if (participants) {
      meeting.participants = Array.isArray(participants) 
        ? participants 
        : participants.split(",").map(email => email.trim());
    }
    if (meetingLink) meeting.meetingLink = meetingLink;
    if (googleCalendarEventId) meeting.googleCalendarEventId = googleCalendarEventId;

    await meeting.save();

    res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réunion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la réunion",
    });
  }
};

// Supprimer une réunion
const deleteMeeting = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID de réunion invalide",
      });
    }

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: "Réunion non trouvée",
      });
    }

    // Vérifier si l'utilisateur est l'organisateur de la réunion
    if (meeting.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à supprimer cette réunion",
      });
    }

    await Meeting.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Réunion supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la réunion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de la réunion",
    });
  }
};

module.exports = {
  createMeeting,
  getAllMeetings,
  getUpcomingMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
};
