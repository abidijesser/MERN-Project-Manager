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
import { toast } from 'react-toastify'

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
      const response = await axios.get(`http://localhost:3001/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setProject(response.data.project)
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération du projet')
    }
  }

  const handleAddComment = async () => {
    try {
      await axios.post(`http://localhost:3001/api/projects/${id}/comments`, 
        { comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      toast.success('Commentaire ajouté avec succès !')
      setComment('')
      fetchProject()
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout du commentaire.')
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
            <h2>{project.projectName}</h2>
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
                {project.comments && project.comments.length > 0 ? (
                  project.comments.map((c, index) => <li key={index}>{c}</li>)
                ) : (
                  <li>Aucun commentaire pour ce projet</li>
                )}
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
