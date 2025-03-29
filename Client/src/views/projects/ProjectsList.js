import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Récupération des projets depuis l'API backend
      const response = await axios.get('http://localhost:3001/api/projects')
      setProjects(response.data.projects) // Mise à jour de l'état avec les projets
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error)
    }
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Liste des projets</strong>
        <CButton
          color="primary"
          className="float-end"
          onClick={() => navigate('/projects/new')}
        >
          Nouveau projet
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nom</CTableHeaderCell>
              <CTableHeaderCell>Statut</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {projects.map((project) => (
              <CTableRow key={project._id}>
                <CTableDataCell>{project.name}</CTableDataCell>
                <CTableDataCell>{project.status}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    Détails
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default ProjectsList
