const Notification = require("../models/Notification");
const User = require("../models/User");

const notificationService = {
  // Créer une notification
  async createNotification(data) {
    try {
      console.log("Création d'une notification:", data);
      const notification = new Notification(data);
      await notification.save();
      console.log("Notification créée avec succès:", notification._id);
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  // Créer une notification de tâche (version robuste)
  async createTaskNotification(task, type, creator) {
    try {
      console.log(
        `Création d'une notification de tâche: ${type} pour la tâche ${task._id}`
      );

      // Vérifier si les paramètres requis sont présents
      if (!task || !task._id) {
        console.error("createTaskNotification - Task is missing or invalid");
        return; // Ne pas bloquer le processus, simplement retourner
      }

      // Gérer le cas où creator est null ou undefined
      const creatorName =
        creator && creator.name ? creator.name : "Un utilisateur";

      try {
        // Récupérer tous les utilisateurs qui doivent être notifiés
        const users = await User.find({});
        console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);

        if (!users || users.length === 0) {
          console.log("Aucun utilisateur trouvé, aucune notification à créer");
          return;
        }

        const notifications = users.map((user) => ({
          recipient: user._id,
          type,
          task: task._id,
          message: getTaskNotificationMessage(task, type, {
            name: creatorName,
          }),
        }));

        console.log(`Création de ${notifications.length} notifications`);
        await Notification.insertMany(notifications);
        console.log("Notifications de tâche créées avec succès");
      } catch (innerError) {
        console.error("Error in notification creation process:", innerError);
        // Ne pas propager l'erreur pour ne pas bloquer le processus principal
      }
    } catch (error) {
      console.error("Error creating task notification:", error);
      // Ne pas propager l'erreur pour ne pas bloquer le processus principal
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      console.log(`Marquage de la notification ${notificationId} comme lue`);
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
      console.log(
        "Notification mise à jour:",
        notification ? "succès" : "non trouvée"
      );
      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Obtenir les notifications d'un utilisateur
  async getUserNotifications(userId) {
    try {
      console.log(
        `Récupération des notifications pour l'utilisateur ${userId}`
      );

      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        console.error(`Utilisateur ${userId} non trouvé`);
        throw new Error(`Utilisateur ${userId} non trouvé`);
      }

      const notifications = await Notification.find({ recipient: userId })
        .populate("task")
        .sort({ createdAt: -1 });

      console.log(
        `Nombre de notifications trouvées pour l'utilisateur ${userId}: ${notifications.length}`
      );
      return notifications;
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  },
};

// Fonction helper pour générer les messages de notification (version robuste)
function getTaskNotificationMessage(task, type, creator) {
  // Vérifier si task est valide
  if (!task || !task.title) {
    return "Nouvelle notification concernant une tâche";
  }

  // Vérifier si creator est valide
  const creatorName = creator && creator.name ? creator.name : "Un utilisateur";

  // Générer le message en fonction du type
  switch (type) {
    case "task_created":
      return `${creatorName} a créé une nouvelle tâche: ${task.title}`;
    case "task_updated":
      return `${creatorName} a mis à jour la tâche: ${task.title}`;
    case "task_assigned":
      return `${creatorName} vous a assigné la tâche: ${task.title}`;
    case "task_completed":
      return `${creatorName} a marqué la tâche comme terminée: ${task.title}`;
    case "task_status_updated":
      return `${creatorName} a mis à jour le statut de la tâche: ${task.title}`;
    default:
      return `Nouvelle notification concernant la tâche: ${task.title}`;
  }
}

module.exports = notificationService;
