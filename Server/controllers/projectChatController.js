const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');
const notificationService = require('../services/notificationService');

// Vérifier si un utilisateur est membre d'un projet
const isProjectMember = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return false;
    }

    // Vérifier si l'utilisateur est le propriétaire ou un membre du projet
    return project.owner.toString() === userId.toString() || 
           project.members.some(member => member.toString() === userId.toString());
  } catch (error) {
    console.error('Error checking project membership:', error);
    return false;
  }
};

// Récupérer les messages d'un projet
exports.getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Vérifier si l'utilisateur est membre du projet
    const isMember = await isProjectMember(projectId, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à accéder aux messages de ce projet"
      });
    }

    // Récupérer les messages du projet
    const messages = await Message.find({ 
      projectId: mongoose.Types.ObjectId(projectId),
      type: 'project'
    })
    .sort({ timestamp: 1 })
    .populate('sender', 'name email')
    .limit(100);

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching project messages:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des messages'
    });
  }
};

// Créer un nouveau message dans un projet
exports.createProjectMessage = async (req, res) => {
  try {
    const { projectId, content } = req.body;
    const userId = req.user.id;

    // Vérifier si l'utilisateur est membre du projet
    const isMember = await isProjectMember(projectId, userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à envoyer des messages dans ce projet"
      });
    }

    // Récupérer les informations de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé"
      });
    }

    // Créer le message
    const message = new Message({
      content,
      sender: userId,
      senderName: user.name || user.email,
      type: 'project',
      projectId,
      timestamp: new Date(),
      room: `project-${projectId}`
    });

    await message.save();

    // Notifier les autres membres du projet
    await notifyProjectMembers(projectId, userId, message);

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error creating project message:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du message'
    });
  }
};

// Notifier les autres membres du projet qu'un nouveau message a été envoyé
const notifyProjectMembers = async (projectId, senderId, message) => {
  try {
    // Récupérer le projet et ses membres
    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Project not found for notification');
      return;
    }

    // Récupérer l'expéditeur
    const sender = await User.findById(senderId);
    if (!sender) {
      console.error('Sender not found for notification');
      return;
    }

    // Collecter tous les membres du projet (y compris le propriétaire)
    const allMembers = [...project.members];
    if (project.owner) {
      allMembers.push(project.owner);
    }

    // Filtrer les membres uniques et exclure l'expéditeur
    const uniqueMembers = [...new Set(allMembers.map(id => id.toString()))]
      .filter(id => id !== senderId.toString());

    // Créer une notification pour chaque membre
    for (const memberId of uniqueMembers) {
      await notificationService.createNotification({
        recipient: memberId,
        type: 'chat_message',
        project: projectId,
        message: `${sender.name || 'Un utilisateur'} a envoyé un message dans le projet ${project.projectName}`,
        createdBy: senderId
      });
    }
  } catch (error) {
    console.error('Error notifying project members:', error);
  }
};
