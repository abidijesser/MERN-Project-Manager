import axios from 'axios';

const API_URL = 'http://192.168.33.10:3001/api';

// Récupérer les données de performance
export const getPerformanceData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Récupérer les tâches
    const tasksResponse = await axios.get(`${API_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Récupérer les projets
    const projectsResponse = await axios.get(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (tasksResponse.data.success && projectsResponse.data) {
      const tasks = tasksResponse.data.tasks;
      const projects = projectsResponse.data.projects;

      // Calculer les KPIs
      const kpis = calculateKPIs(tasks, projects);

      // Préparer les données pour les graphiques
      const chartData = prepareChartData(tasks, projects);

      return {
        kpis,
        chartData,
        tasks,
        projects
      };
    } else {
      throw new Error('Failed to fetch performance data');
    }
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw error;
  }
};

// Calculer les KPIs à partir des tâches et des projets
const calculateKPIs = (tasks, projects) => {
  // Taux d'avancement global (%)
  const completedTasks = tasks.filter(task =>
    task.status === 'Done' || task.status === 'Terminée'
  ).length;
  const totalTasks = tasks.length;
  const progressRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Délai moyen de réalisation des tâches (en jours)
  const completedTasksWithDates = tasks.filter(task =>
    (task.status === 'Done' || task.status === 'Terminée') && task.createdAt && task.updatedAt
  );

  let averageTaskTime = 0;
  if (completedTasksWithDates.length > 0) {
    const totalDays = completedTasksWithDates.reduce((sum, task) => {
      const createdDate = new Date(task.createdAt);
      const completedDate = new Date(task.updatedAt);
      const days = Math.round((completedDate - createdDate) / (1000 * 60 * 60 * 24));
      return sum + Math.max(days, 1); // Au moins 1 jour
    }, 0);
    averageTaskTime = Math.round(totalDays / completedTasksWithDates.length);
  }

  // Taux de respect des échéances (%)
  const tasksWithDueDate = tasks.filter(task =>
    task.dueDate && (task.status === 'Done' || task.status === 'Terminée')
  );
  let onTimeCount = 0;

  if (tasksWithDueDate.length > 0) {
    onTimeCount = tasksWithDueDate.filter(task => {
      const dueDate = new Date(task.dueDate);
      const completedDate = new Date(task.updatedAt);
      return completedDate <= dueDate;
    }).length;
  }

  const deadlineRespect = tasksWithDueDate.length > 0
    ? Math.round((onTimeCount / tasksWithDueDate.length) * 100)
    : 0;

  // Productivité par équipe (calculée à partir des tâches assignées)
  // Calculer la productivité réelle basée sur les projets
  let teamProductivity = 0;
  if (projects.length > 0) {
    // Calculer le pourcentage moyen de tâches terminées par projet
    const projectCompletionRates = projects.map(project => {
      const projectTasks = tasks.filter(task =>
        task.project && (typeof task.project === 'object' ?
          task.project._id === project._id :
          task.project === project._id)
      );

      if (projectTasks.length === 0) return 0;

      const projectCompletedTasks = projectTasks.filter(task =>
        task.status === 'Done' || task.status === 'Terminée'
      ).length;

      return projectCompletedTasks / projectTasks.length * 100;
    });

    // Moyenne des taux d'achèvement
    teamProductivity = Math.round(
      projectCompletionRates.reduce((sum, rate) => sum + rate, 0) / projects.length
    );
  } else {
    teamProductivity = 85; // Valeur par défaut si aucun projet
  }

  // Nombre de risques détectés
  // Considérer les tâches en retard comme des risques
  const lateTasks = tasks.filter(task => {
    if (task.dueDate && task.status !== 'Done' && task.status !== 'Terminée') {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today;
    }
    return false;
  });

  const risksDetected = lateTasks.length;

  return {
    progressRate: {
      value: progressRate,
      trend: 5, // Valeur fictive pour la tendance
      description: "Taux d'avancement global des projets"
    },
    averageTaskTime: {
      value: averageTaskTime,
      unit: "jours",
      trend: -1, // Valeur fictive pour la tendance
      description: "Temps moyen pour compléter une tâche"
    },
    deadlineRespect: {
      value: deadlineRespect,
      trend: 2, // Valeur fictive pour la tendance
      description: "Pourcentage de tâches terminées dans les délais"
    },
    teamProductivity: {
      value: teamProductivity,
      trend: 3, // Valeur fictive pour la tendance
      description: "Indice de productivité des équipes"
    },
    risksDetected: {
      value: risksDetected,
      trend: risksDetected > 3 ? 2 : -2, // Tendance basée sur le nombre de risques
      description: "Nombre de risques identifiés nécessitant une attention"
    }
  };
};

// Préparer les données pour les graphiques
const prepareChartData = (tasks, projects) => {
  // Données pour la courbe d'évolution des tâches
  const taskStatusByMonth = {};
  const currentYear = new Date().getFullYear();

  // Initialiser les mois
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  months.forEach(month => {
    taskStatusByMonth[month] = { completed: 0, inProgress: 0, planned: 0 };
  });

  // Compter les tâches par mois et par statut
  tasks.forEach(task => {
    const createdDate = new Date(task.createdAt);
    if (createdDate.getFullYear() === currentYear) {
      const month = months[createdDate.getMonth()];

      // Mapping des statuts de tâches selon le modèle de données
      if (task.status === 'Done' || task.status === 'Terminée') {
        taskStatusByMonth[month].completed += 1;
      } else if (task.status === 'In Progress' || task.status === 'En cours') {
        taskStatusByMonth[month].inProgress += 1;
      }

      // Toutes les tâches sont considérées comme planifiées
      taskStatusByMonth[month].planned += 1;
    }
  });

  // Convertir en tableau pour Recharts
  const taskEvolutionData = months.map(month => ({
    name: month,
    completed: taskStatusByMonth[month].completed,
    inProgress: taskStatusByMonth[month].inProgress,
    planned: taskStatusByMonth[month].planned
  }));

  // Données pour le diagramme des délais
  const delayData = projects.map(project => {
    // Utiliser les dates réelles du projet pour les calculs
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();

    // Calculer le délai prévu en jours
    const plannedDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Calculer le délai réel en jours (jusqu'à aujourd'hui ou jusqu'à la fin si terminé)
    const isCompleted = project.status === 'Completed' || project.status === 'Archived';
    const actualEndDate = isCompleted ? endDate : today;
    const actualDays = Math.round((actualEndDate - startDate) / (1000 * 60 * 60 * 24));

    return {
      name: project.projectName || `Projet ${project._id.substring(0, 5)}`,
      actual: actualDays > 0 ? actualDays : 1,
      planned: plannedDays > 0 ? plannedDays : 1
    };
  });

  // Données pour la heatmap (fictives)
  const heatmapData = [
    { day: 'Lundi', '8h': 2, '9h': 5, '10h': 8, '11h': 6, '12h': 3, '13h': 2, '14h': 5, '15h': 7, '16h': 9, '17h': 4 },
    { day: 'Mardi', '8h': 3, '9h': 6, '10h': 9, '11h': 7, '12h': 4, '13h': 3, '14h': 6, '15h': 8, '16h': 7, '17h': 5 },
    { day: 'Mercredi', '8h': 4, '9h': 7, '10h': 10, '11h': 8, '12h': 5, '13h': 4, '14h': 7, '15h': 9, '16h': 8, '17h': 6 },
    { day: 'Jeudi', '8h': 5, '9h': 8, '10h': 9, '11h': 7, '12h': 4, '13h': 3, '14h': 6, '15h': 8, '16h': 9, '17h': 7 },
    { day: 'Vendredi', '8h': 4, '9h': 7, '10h': 8, '11h': 6, '12h': 3, '13h': 2, '14h': 5, '15h': 7, '16h': 8, '17h': 5 },
  ];

  // Données de statut des projets
  const projectStatusData = projects.map(project => {
    // Déterminer le statut du projet
    let status = 'in-progress';
    if (project.status === 'Terminé') {
      status = 'completed';
    } else if (project.status === 'En retard') {
      status = 'delayed';
    } else if (project.status === 'À risque') {
      status = 'at-risk';
    }

    // Calculer le progrès (fictif)
    const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10;

    return {
      id: project._id,
      name: project.projectName || `Projet ${project._id.substring(0, 5)}`,
      status,
      progress,
      deadline: project.endDate || new Date().toISOString()
    };
  });

  // Données de performance individuelle (fictives)
  const teamPerformanceData = [
    { id: 1, name: 'Sophie Martin', role: 'Développeur Frontend', tasksCompleted: 24, onTime: 22, efficiency: 92 },
    { id: 2, name: 'Thomas Dubois', role: 'Développeur Backend', tasksCompleted: 18, onTime: 15, efficiency: 83 },
    { id: 3, name: 'Emma Lefebvre', role: 'Designer UI/UX', tasksCompleted: 15, onTime: 14, efficiency: 93 },
    { id: 4, name: 'Lucas Bernard', role: 'Chef de Projet', tasksCompleted: 12, onTime: 10, efficiency: 83 },
    { id: 5, name: 'Camille Petit', role: 'Testeur QA', tasksCompleted: 30, onTime: 28, efficiency: 93 },
  ];

  // Données de suivi des risques
  const riskData = lateTasks = tasks.filter(task => {
    if (task.dueDate && task.status !== 'Terminée') {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today;
    }
    return false;
  }).map((task, index) => {
    // Déterminer l'impact en fonction de la priorité
    let impact = 'medium';
    if (task.priority === 'Haute') {
      impact = 'high';
    } else if (task.priority === 'Basse') {
      impact = 'low';
    }

    return {
      id: index + 1,
      project: task.project || 'Non assigné',
      description: `Tâche en retard: ${task.title}`,
      impact,
      status: 'open',
      mitigation: 'Réaffectation des ressources recommandée'
    };
  });

  // Données de répartition des ressources (fictives)
  const resourceAllocationData = [
    { team: 'Frontend', allocated: 35, used: 32 },
    { team: 'Backend', allocated: 40, used: 38 },
    { team: 'Design', allocated: 20, used: 22 },
    { team: 'QA', allocated: 15, used: 13 },
    { team: 'DevOps', allocated: 10, used: 8 },
  ];

  // Suggestions IA basées sur les données réelles
  const aiSuggestions = [];

  // Suggestion 1: Risque de retard
  if (riskData.length > 0) {
    aiSuggestions.push({
      id: 1,
      title: `Risque de retard sur ${riskData.length} tâche(s)`,
      description: `${riskData.length} tâche(s) ont dépassé leur date d'échéance. Considérez de réaffecter des ressources ou d'ajuster le calendrier.`,
      type: 'warning'
    });
  }

  // Suggestion 2: Optimisation d'équipe
  const highEfficiencyTeam = teamPerformanceData.reduce((prev, current) =>
    (prev.efficiency > current.efficiency) ? prev : current
  );

  aiSuggestions.push({
    id: 2,
    title: `Optimisation de l'équipe ${highEfficiencyTeam.role}`,
    description: `L'équipe ${highEfficiencyTeam.role} montre une efficacité de ${highEfficiencyTeam.efficiency}%. Envisagez de partager leurs meilleures pratiques avec les autres équipes.`,
    type: 'success'
  });

  // Suggestion 3: Replanification
  if (deadlineRespect < 80) {
    aiSuggestions.push({
      id: 3,
      title: 'Replanification recommandée',
      description: `Le taux de respect des échéances est de ${deadlineRespect}%. Une replanification automatique pourrait réduire les risques de retard.`,
      type: 'info'
    });
  }

  return {
    taskEvolutionData,
    delayData,
    heatmapData,
    projectStatusData,
    teamPerformanceData,
    riskData,
    resourceAllocationData,
    aiSuggestions
  };
};

// Exporter les données au format PDF
export const exportToPDF = async (data = null) => {
  try {
    console.log('Exporting to PDF...');

    // Si aucune donnée n'est fournie, récupérer les données de performance
    if (!data) {
      data = await getProjectsPerformance();
    }

    // Dans une implémentation réelle, nous utiliserions une bibliothèque comme jsPDF
    // pour générer un PDF avec les données

    // Simulation d'un délai pour l'export
    return new Promise((resolve) => {
      setTimeout(() => {
        // Générer un nom de fichier avec la date actuelle
        const date = new Date().toISOString().split('T')[0];
        const filename = `performance_report_${date}.pdf`;

        // Dans une implémentation réelle, nous téléchargerions le fichier ici
        console.log(`PDF exporté sous le nom: ${filename}`);

        resolve({
          success: true,
          message: 'PDF exporté avec succès',
          filename,
          data
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    throw error;
  }
};

// Exporter les données au format CSV
export const exportToCSV = async (data = null) => {
  try {
    console.log('Exporting to CSV...');

    // Si aucune donnée n'est fournie, récupérer les données de performance
    if (!data) {
      data = await getProjectsPerformance();
    }

    // Fonction pour convertir les données en format CSV
    const convertToCSV = (objArray) => {
      const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
      let str = '';

      // En-têtes
      const headers = Object.keys(array[0]);
      str += headers.join(',') + '\r\n';

      // Lignes de données
      for (let i = 0; i < array.length; i++) {
        let line = '';
        for (const index in headers) {
          if (line !== '') line += ',';

          let value = array[i][headers[index]];
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          line += `"${value}"`;
        }
        str += line + '\r\n';
      }
      return str;
    };

    // Préparer les données pour l'export CSV
    const projectsData = data.projects.map(project => ({
      id: project._id,
      name: project.projectName,
      status: project.performance.status,
      completionRate: project.performance.completionRate + '%',
      timeEfficiency: project.performance.timeEfficiency + '%',
      riskLevel: project.performance.riskLevel + '%',
      taskCount: project.performance.taskCount,
      completedTasks: project.performance.completedTaskCount,
      lateTasks: project.performance.lateTaskCount
    }));

    // Convertir en CSV
    const csvContent = convertToCSV(projectsData);

    // Simulation d'un délai pour l'export
    return new Promise((resolve) => {
      setTimeout(() => {
        // Générer un nom de fichier avec la date actuelle
        const date = new Date().toISOString().split('T')[0];
        const filename = `performance_report_${date}.csv`;

        // Dans une implémentation réelle, nous téléchargerions le fichier ici
        // Voici comment on pourrait le faire dans un navigateur:
        /*
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        */

        console.log(`CSV exporté sous le nom: ${filename}`);

        resolve({
          success: true,
          message: 'CSV exporté avec succès',
          filename,
          data: csvContent
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    throw error;
  }
};

// Exporter les données au format Excel
export const exportToExcel = () => {
  // Implémentation fictive
  console.log('Exporting to Excel...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Excel exported successfully' });
    }, 1000);
  });
};

// Récupérer et analyser les performances des projets
export const getProjectsPerformance = async (filters = {}) => {
  try {
    console.log('Fetching performance data with filters:', filters);
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Récupérer les projets depuis la base de données
    const projectsResponse = await axios.get(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Récupérer les tâches pour calculer les métriques de performance
    const tasksResponse = await axios.get(`${API_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!projectsResponse.data || !tasksResponse.data) {
      throw new Error('Failed to fetch projects or tasks data');
    }

    let projects = projectsResponse.data.projects;
    let tasks = tasksResponse.data.tasks;

    console.log(`Fetched ${projects.length} projects and ${tasks.length} tasks`);

    // Appliquer les filtres si présents
    if (filters.projectId) {
      console.log(`Filtering by project ID: ${filters.projectId}`);
      projects = projects.filter(project => project._id === filters.projectId);
      console.log(`After project filter: ${projects.length} projects`);
    }

    if (filters.dateRange && filters.dateRange.length === 2 &&
        filters.dateRange[0] && filters.dateRange[1]) {
      // Convertir les objets dayjs en objets Date si nécessaire
      const startDate = filters.dateRange[0].$d ? new Date(filters.dateRange[0].$d) : new Date(filters.dateRange[0]);
      const endDate = filters.dateRange[1].$d ? new Date(filters.dateRange[1].$d) : new Date(filters.dateRange[1]);

      // Régler l'heure de fin à 23:59:59 pour inclure toute la journée
      endDate.setHours(23, 59, 59, 999);

      console.log(`Filtering by date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Filtrer les projets par date
      projects = projects.filter(project => {
        if (!project.startDate || !project.endDate) return false;

        // Normaliser les dates du projet
        const projectStartDate = new Date(project.startDate);
        const projectEndDate = new Date(project.endDate);

        // Régler l'heure de fin du projet à 23:59:59
        projectEndDate.setHours(23, 59, 59, 999);

        // Un projet est inclus si sa période chevauche la période de filtre
        // (début du projet <= fin de la période) ET (fin du projet >= début de la période)
        const isIncluded = (projectStartDate <= endDate && projectEndDate >= startDate);

        if (isIncluded) {
          console.log(`Project included: ${project.projectName}, Start: ${projectStartDate.toISOString()}, End: ${projectEndDate.toISOString()}`);
        }

        return isIncluded;
      });

      console.log(`After date filter: ${projects.length} projects`);

      // Filtrer les tâches par date et par projet
      tasks = tasks.filter(task => {
        // Ne garder que les tâches associées aux projets filtrés
        const isInFilteredProject = projects.some(project =>
          task.project && (
            (typeof task.project === 'object' && task.project._id === project._id) ||
            task.project === project._id
          )
        );

        if (!isInFilteredProject) return false;

        // Si la tâche a une date d'échéance, vérifier si elle est dans la plage
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const isDueDateInRange = dueDate >= startDate && dueDate <= endDate;

          if (isDueDateInRange) {
            return true;
          }
        }

        // Vérifier si la tâche a été créée ou mise à jour dans la période
        const taskCreatedDate = task.createdAt ? new Date(task.createdAt) : null;
        const taskUpdatedDate = task.updatedAt ? new Date(task.updatedAt) : null;

        const createdInRange = taskCreatedDate && taskCreatedDate >= startDate && taskCreatedDate <= endDate;
        const updatedInRange = taskUpdatedDate && taskUpdatedDate >= startDate && taskUpdatedDate <= endDate;

        return createdInRange || updatedInRange;
      });

      console.log(`After task filter: ${tasks.length} tasks`);
    }

    // Calculer les métriques de performance pour chaque projet
    const projectsWithPerformance = projects.map(project => {
      // Filtrer les tâches associées à ce projet
      const projectTasks = tasks.filter(task => task.project && task.project._id === project._id);

      // Calculer le taux d'achèvement (pourcentage de tâches terminées)
      const totalProjectTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(task => task.status === 'Done' || task.status === 'Terminée').length;
      const completionRate = totalProjectTasks > 0 ? Math.round((completedTasks / totalProjectTasks) * 100) : 0;

      // Calculer l'efficacité temporelle (durée réelle vs prévue)
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const plannedDuration = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)); // en jours

      const today = new Date();
      const actualDuration = Math.round((today - startDate) / (1000 * 60 * 60 * 24)); // en jours

      // Si le projet est terminé, utiliser la date de fin réelle, sinon utiliser aujourd'hui
      const timeEfficiency = plannedDuration > 0 ? Math.round((plannedDuration / actualDuration) * 100) : 0;

      // Calculer le niveau de risque basé sur les tâches en retard
      const lateTasks = projectTasks.filter(task => {
        if (task.dueDate && task.status !== 'Done' && task.status !== 'Terminée') {
          const dueDate = new Date(task.dueDate);
          return dueDate < today;
        }
        return false;
      });

      const riskLevel = totalProjectTasks > 0 ? Math.round((lateTasks.length / totalProjectTasks) * 100) : 0;

      // Déterminer le statut du projet
      let status = 'in-progress';
      if (project.status === 'Completed' || project.status === 'Archived') {
        status = 'completed';
      } else if (riskLevel > 30) {
        status = 'at-risk';
      } else if (timeEfficiency < 70) {
        status = 'delayed';
      }

      // Calculer l'utilisation des ressources (fictif pour l'instant)
      const resourceUtilization = Math.floor(Math.random() * 30) + 70; // Valeur entre 70 et 100

      return {
        ...project,
        performance: {
          completionRate,
          timeEfficiency: timeEfficiency > 100 ? 100 : timeEfficiency, // Plafonner à 100%
          riskLevel,
          status,
          resourceUtilization,
          taskCount: totalProjectTasks,
          completedTaskCount: completedTasks,
          lateTaskCount: lateTasks.length,
          plannedDuration,
          actualDuration
        }
      };
    });

    // Calculer les KPIs globaux pour tous les projets
    const averageCompletionRate = projectsWithPerformance.reduce((sum, project) =>
      sum + project.performance.completionRate, 0) / projectsWithPerformance.length || 0;

    const averageTimeEfficiency = projectsWithPerformance.reduce((sum, project) =>
      sum + project.performance.timeEfficiency, 0) / projectsWithPerformance.length || 0;

    const totalRisks = projectsWithPerformance.reduce((sum, project) =>
      sum + project.performance.lateTaskCount, 0);

    const projectsAtRisk = projectsWithPerformance.filter(project =>
      project.performance.status === 'at-risk').length;

    // Préparer les données pour les graphiques
    const performanceChartData = projectsWithPerformance.map(project => ({
      name: project.projectName || `Projet ${project._id.substring(0, 5)}`,
      completion: project.performance.completionRate,
      efficiency: project.performance.timeEfficiency,
      risk: project.performance.riskLevel
    }));

    // Données pour le graphique de répartition des statuts
    const statusDistribution = {
      completed: projectsWithPerformance.filter(p => p.performance.status === 'completed').length,
      inProgress: projectsWithPerformance.filter(p => p.performance.status === 'in-progress').length,
      delayed: projectsWithPerformance.filter(p => p.performance.status === 'delayed').length,
      atRisk: projectsWithPerformance.filter(p => p.performance.status === 'at-risk').length
    };

    // Générer des recommandations basées sur l'analyse
    const recommendations = [];

    if (projectsAtRisk > 0) {
      recommendations.push({
        id: 1,
        title: `${projectsAtRisk} projet(s) à risque détecté(s)`,
        description: `${projectsAtRisk} projet(s) présentent un niveau de risque élevé. Considérez une révision des échéances ou une réallocation des ressources.`,
        type: 'warning'
      });
    }

    if (averageTimeEfficiency < 80) {
      recommendations.push({
        id: 2,
        title: 'Efficacité temporelle faible',
        description: `L'efficacité temporelle moyenne des projets est de ${Math.round(averageTimeEfficiency)}%. Envisagez de revoir la planification des projets.`,
        type: 'info'
      });
    }

    // Identifier le projet le plus performant
    const bestProject = [...projectsWithPerformance].sort((a, b) =>
      (b.performance.completionRate + b.performance.timeEfficiency) -
      (a.performance.completionRate + a.performance.timeEfficiency)
    )[0];

    if (bestProject) {
      recommendations.push({
        id: 3,
        title: `Projet performant: ${bestProject.projectName}`,
        description: `Le projet ${bestProject.projectName} montre d'excellentes performances. Analysez ses méthodes de gestion pour les appliquer à d'autres projets.`,
        type: 'success'
      });
    }

    return {
      projects: projectsWithPerformance,
      kpis: {
        averageCompletionRate: Math.round(averageCompletionRate),
        averageTimeEfficiency: Math.round(averageTimeEfficiency),
        totalRisks,
        projectsAtRisk
      },
      charts: {
        performanceChartData,
        statusDistribution
      },
      recommendations
    };
  } catch (error) {
    console.error('Error fetching and analyzing projects performance:', error);
    throw error;
  }
};
