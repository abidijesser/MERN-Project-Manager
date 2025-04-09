const Notification = require('../models/Notification');
const User = require('../models/User');

const notificationService = {
  // Créer une notification
  async createNotification(data) {
    try {
      console.log('Création d\'une notification:', data);
      const notification = new Notification(data);
      await notification.save();
      console.log('Notification créée avec succès:', notification._id);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Créer une notification de tâche
  async createTaskNotification(task, type, creator) {
    try {
      console.log(`Création d'une notification de tâche: ${type} pour la tâche ${task._id}`);
      
      // Récupérer tous les utilisateurs qui doivent être notifiés
      const users = await User.find({});
      console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
      
      const notifications = users.map(user => ({
        recipient: user._id,
        type,
        task: task._id,
        message: getTaskNotificationMessage(task, type, creator),
      }));

      console.log(`Création de ${notifications.length} notifications`);
      await Notification.insertMany(notifications);
      console.log('Notifications de tâche créées avec succès');
    } catch (error) {
      console.error('Error creating task notification:', error);
      throw error;
    }
  },

  // Créer une notification de suppression de tâche
  async createTaskDeletionNotification(task, deleter) {
    try {
      console.log(`Création d'une notification de suppression pour la tâche ${task._id}`);
      
      // Récupérer tous les utilisateurs qui doivent être notifiés
      const users = await User.find({});
      console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
      
      const notifications = users.map(user => ({
        recipient: user._id,
        type: 'task_deleted',
        task: task._id,
        message: `${deleter.name} a supprimé la tâche: ${task.title}`,
      }));

      console.log(`Création de ${notifications.length} notifications`);
      await Notification.insertMany(notifications);
      console.log('Notifications de suppression de tâche créées avec succès');
    } catch (error) {
      console.error('Error creating task deletion notification:', error);
      throw error;
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
      console.log('Notification mise à jour:', notification ? 'succès' : 'non trouvée');
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Obtenir les notifications d'un utilisateur
  async getUserNotifications(userId) {
    try {
      console.log(`Récupération des notifications pour l'utilisateur ${userId}`);
      
      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        console.error(`Utilisateur ${userId} non trouvé`);
        throw new Error(`Utilisateur ${userId} non trouvé`);
      }
      
      const notifications = await Notification.find({ recipient: userId })
        .populate('task')
        .sort({ createdAt: -1 });
      
      console.log(`Nombre de notifications trouvées pour l'utilisateur ${userId}: ${notifications.length}`);
      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }
};

// Fonction helper pour générer les messages de notification
function getTaskNotificationMessage(task, type, creator) {
  switch (type) {
    case 'task_created':
      return `${creator.name} a créé une nouvelle tâche: ${task.title}`;
    case 'task_updated':
      return `${creator.name} a mis à jour la tâche: ${task.title}`;
    case 'task_assigned':
      return `${creator.name} vous a assigné la tâche: ${task.title}`;
    case 'task_completed':
      return `${creator.name} a marqué la tâche comme terminée: ${task.title}`;
    default:
      return `Nouvelle notification concernant la tâche: ${task.title}`;
  }
}

module.exports = notificationService;