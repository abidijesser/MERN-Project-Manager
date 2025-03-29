import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormTextarea,
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ProjectDetails = () => {
  const [project, setProject] = useState(null)
  const [comment, setComment] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/projects/${id}`)
      setProject(response.data.project)
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const handleAddComment = async () => {
    try {
      // Envoi du commentaire au backend
      await axios.post(`http://localhost:3001/api/projects/${id}/comments`, { comment })
      setComment('') // Réinitialisation du champ de commentaire
      fetchProject() // Rafraîchissement des détails du projet
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
    }
  }

  if (!project) {
    return <div>Chargement...</div>
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Détails du projet</strong>
            <CButton
              color="secondary"
              className="float-end"
              onClick={() => navigate('/projects')}
            >
              Retour
            </CButton>
          </CCardHeader>
          <CCardBody>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <p>
              <strong>Statut:</strong> {project.status}
            </p>
            <p>
              <strong>Date de début:</strong> {new Date(project.startDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Date de fin:</strong> {new Date(project.endDate).toLocaleDateString()}
            </p>
            <div>
              <strong>Commentaires:</strong>
              <ul>
                {project.comments.map((c, index) => (
                  <li key={index}>{c}</li>
                ))}
              </ul>
              <CFormTextarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajouter un commentaire"
              />
              <CButton color="primary" onClick={handleAddComment}>
                Ajouter
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProjectDetails
