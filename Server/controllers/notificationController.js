const notificationService = require("../services/notificationService");
const Notification = require("../models/Notification");

// Obtenir les notifications de l'utilisateur
const getUserNotifications = async (req, res) => {
  try {
    console.log(
      "Récupération des notifications pour l'utilisateur:",
      req.user.id
    );

    // Vérifier si l'utilisateur existe
    if (!req.user || !req.user.id) {
      console.error("Utilisateur non trouvé dans la requête");
      return res.status(401).json({
        success: false,
        error: "Utilisateur non authentifié",
      });
    }

    const notifications = await notificationService.getUserNotifications(
      req.user.id
    );
    console.log(`Nombre de notifications trouvées: ${notifications.length}`);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des notifications",
      details: error.message,
    });
  }
};

// Marquer une notification comme lue
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    console.log("Marquage de la notification comme lue:", notificationId);

    const notification = await notificationService.markAsRead(notificationId);

    if (!notification) {
      console.log("Notification non trouvée:", notificationId);
      return res.status(404).json({
        success: false,
        error: "Notification non trouvée",
      });
    }

    console.log("Notification marquée comme lue avec succès");
    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la notification",
      details: error.message,
    });
  }
};

// Marquer toutes les notifications d'un utilisateur comme lues
const markAllNotificationsAsRead = async (req, res) => {
  try {
    console.log(
      "Marquage de toutes les notifications comme lues pour l'utilisateur:",
      req.user.id
    );

    // Vérifier si l'utilisateur existe
    if (!req.user || !req.user.id) {
      console.error("Utilisateur non trouvé dans la requête");
      return res.status(401).json({
        success: false,
        error: "Utilisateur non authentifié",
      });
    }

    // Mettre à jour toutes les notifications non lues de l'utilisateur
    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );

    console.log(`${result.modifiedCount} notifications marquées comme lues`);

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marquées comme lues`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour des notifications",
      details: error.message,
    });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
