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
import { toast } from 'react-toastify'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Récupération des projets depuis l'API backend
      const response = await axios.get('http://localhost:3001/api/projects', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setProjects(response.data.projects) // Mise à jour de l'état avec les projets
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des projets')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await axios.delete(`http://localhost:3001/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        toast.success('Projet supprimé avec succès !')
        fetchProjects()
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression du projet')
      }
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
                <CTableDataCell>{project.projectName}</CTableDataCell> {/* Utilisation de projectName */}
                <CTableDataCell>{project.status}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    Détails
                  </CButton>
                  <CButton
                    color="warning"
                    size="sm"
                    className="ms-2"
                    onClick={() => navigate(`/projects/edit/${project._id}`)}
                  >
                    Modifier
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleDelete(project._id)} // Appel à la fonction de suppression
                  >
                    Supprimer
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
