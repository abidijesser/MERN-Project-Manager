import React from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CProgress,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CBadge,
  CCardTitle,
  CCardSubtitle,
  CCardText,
  CCardLink,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilClock, cilList, cilTask } from '@coreui/icons';
const tasks = [
  { id: 1, name: "Définir les objectifs", status: "Terminé", priority: "Haute", assignee: "Alice" },
  { id: 2, name: "Collecte de données", status: "En cours", priority: "Moyenne", assignee: "Bob" },
  { id: 3, name: "Analyse des risques", status: "À faire", priority: "Haute", assignee: "Charlie" },
  { id: 4, name: "Optimisation des ressources", status: "À faire", priority: "Basse", assignee: "David" },
];

const taskStats = [
  { name: "À faire", value: tasks.filter((t) => t.status === "À faire").length },
  { name: "En cours", value: tasks.filter((t) => t.status === "En cours").length },
  { name: "Terminé", value: tasks.filter((t) => t.status === "Terminé").length },
];

const members = [
  { name: "Alice", role: "Chef de projet" },
  { name: "Bob", role: "Data Scientist" },
  { name: "Charlie", role: "Développeur" },
  { name: "David", role: "Analyste" },
];


const Dashboard = () => {
  const projects = [
    { name: 'Refonte du site web', progress: 80, status: 'En cours' },
    { name: 'Développement API', progress: 50, status: 'En cours' },
    { name: 'Audit sécurité', progress: 100, status: 'Terminé' },
  ];

  const tasks = [
    { title: 'Correction bug #245', assignee: 'Alice', status: 'À faire' },
    { title: 'Ajouter analytics', assignee: 'Bob', status: 'En cours' },
    { title: 'Documentation API', assignee: 'Charlie', status: 'Terminé' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'En cours':
        return 'warning';
      case 'Terminé':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
   <CRow>
    
  <CCol md={6}>
    
    <CCard className="mb-4 shadow-lg" style={{ borderRadius: '10px', border: '1px solid #ddd' }}>
      <CCardHeader>
        <CIcon icon={cilList} className="me-2" style={{ fontSize: '1.5rem' }} /> Projets
      </CCardHeader>
      <CCardBody>
        {projects.map((project, index) => (
          <div key={index} className="mb-3">
            <strong>{project.name}</strong>
            <CProgress className="mt-2" value={project.progress} />
            <CBadge color={getStatusBadge(project.status)} className="ms-2" style={{ fontSize: '1rem' }}>
              {project.status}
            </CBadge>
          </div>
        ))}
      </CCardBody>
    </CCard>
  </CCol>

  <CCol md={6}>
    <CCard className="mb-4 shadow-lg" style={{ borderRadius: '10px', border: '1px solid #ddd' }}>
      <CCardHeader>
        <CIcon icon={cilTask} className="me-2" style={{ fontSize: '1.5rem' }} /> Tâches
      </CCardHeader>
      <CCardBody>
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Titre</CTableHeaderCell>
              <CTableHeaderCell>Assigné</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {tasks.map((task, index) => (
              <CTableRow key={index} className="border-bottom">
                <CTableDataCell>{task.title}</CTableDataCell>
                <CTableDataCell>{task.assignee}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={getStatusBadge(task.status)} className="ms-2" style={{ fontSize: '1rem' }}>
                    {task.status}
                  </CBadge>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  </CCol>
</CRow>

  );
};

export default Dashboard;
