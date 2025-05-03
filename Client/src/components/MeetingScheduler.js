import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaUser, FaLink, FaVideo, FaPlus, FaUsers } from 'react-icons/fa'
import axios from '../utils/axios' // Utiliser l'instance axios configurée
import { createMeeting, fetchUpcomingMeetings } from '../services/meetingsService'
import { generateMeetLink, checkGoogleCalendarAuth, getGoogleCalendarAuthUrl } from '../services/googleMeetService'
import './MeetingScheduler.css'

const MeetingScheduler = () => {
  const [meetingDetails, setMeetingDetails] = useState({
    title: 'Réunion',
    date: '',
    participants: '',
    zoomLink: '',
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [loadingMeetings, setLoadingMeetings] = useState(false)
  const [generatingMeet, setGeneratingMeet] = useState(false)
  const [meetLink, setMeetLink] = useState('')

  // Fetch users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // L'instance axios est déjà configurée avec le token dans les headers
        const response = await axios.get('/api/auth/users-for-sharing')

        if (response.data && response.data.success) {
          setUsers(response.data.data)
          console.log('Users fetched successfully:', response.data.data.length)
        } else {
          console.error('Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Fetch upcoming meetings
  useEffect(() => {
    const loadUpcomingMeetings = async () => {
      try {
        setLoadingMeetings(true)
        const response = await fetchUpcomingMeetings(3) // Récupérer les 3 prochaines réunions

        if (response && response.success) {
          setUpcomingMeetings(response.meetings)
          console.log('Upcoming meetings fetched successfully:', response.meetings.length)
        } else {
          console.error('Failed to fetch upcoming meetings')
        }
      } catch (error) {
        console.error('Error fetching upcoming meetings:', error)
      } finally {
        setLoadingMeetings(false)
      }
    }

    loadUpcomingMeetings()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMeetingDetails((prevDetails) => ({ ...prevDetails, [name]: value }))
  }

  // Toggle user list visibility
  const toggleUserList = () => {
    setShowUserList((prev) => !prev)
  }

  // Handle user selection
  const handleUserSelect = (user) => {
    const currentEmails = meetingDetails.participants ? meetingDetails.participants.split(',').map(email => email.trim()) : []
    const userEmail = user.email.trim()

    // Check if email is already in the list
    if (!currentEmails.includes(userEmail)) {
      const updatedEmails = [...currentEmails, userEmail].filter(Boolean).join(', ')
      setMeetingDetails((prev) => ({ ...prev, participants: updatedEmails }))
    }

    // Hide the user list after selection
    setShowUserList(false)
  }

  // Import all user emails
  const importAllUserEmails = () => {
    if (users.length > 0) {
      const allEmails = users.map(user => user.email).join(', ')
      setMeetingDetails((prev) => ({ ...prev, participants: allEmails }))
      setShowUserList(false)
    }
  }

  // Générer un lien Google Meet en utilisant l'API du serveur
  const generateGoogleMeetLink = async () => {
    if (!meetingDetails.date) {
      alert('Veuillez sélectionner une date pour la réunion avant de générer un lien Meet')
      return
    }

    try {
      setGeneratingMeet(true)
      console.log('Génération d\'un lien Google Meet via l\'API du serveur...')

      // Vérifier si l'utilisateur est authentifié avec Google Calendar
      const authCheck = await checkGoogleCalendarAuth()

      // Si l'utilisateur n'est pas authentifié, rediriger vers l'authentification
      if (!authCheck.isAuthenticated) {
        console.log('Utilisateur non authentifié avec Google Calendar')
        const authUrlResponse = await getGoogleCalendarAuthUrl()

        if (authUrlResponse.success && authUrlResponse.authUrl) {
          if (confirm('Vous devez vous connecter à Google Calendar pour générer un lien Meet. Voulez-vous vous connecter maintenant?')) {
            // Ouvrir l'URL d'authentification dans une nouvelle fenêtre
            window.open(authUrlResponse.authUrl, '_blank')
            alert('Après vous être connecté à Google Calendar, revenez sur cette page et réessayez de générer un lien Meet.')
          }
        } else {
          alert('Impossible d\'obtenir l\'URL d\'authentification Google Calendar.')
        }

        setGeneratingMeet(false)
        return
      }

      // Générer le lien Meet
      const result = await generateMeetLink(meetingDetails.date)

      if (result.success && result.meetLink) {
        setMeetLink(result.meetLink)
        setMeetingDetails(prev => ({ ...prev, zoomLink: result.meetLink }))
        console.log('Lien Google Meet généré avec succès:', result.meetLink)
      } else if (result.needsAuth) {
        // Si l'authentification a expiré, rediriger vers l'authentification
        console.log('Authentification Google Calendar expirée')
        const authUrlResponse = await getGoogleCalendarAuthUrl()

        if (authUrlResponse.success && authUrlResponse.authUrl) {
          if (confirm('Votre connexion à Google Calendar a expiré. Voulez-vous vous reconnecter maintenant?')) {
            // Ouvrir l'URL d'authentification dans une nouvelle fenêtre
            window.open(authUrlResponse.authUrl, '_blank')
            alert('Après vous être reconnecté à Google Calendar, revenez sur cette page et réessayez de générer un lien Meet.')
          }
        } else {
          alert('Impossible d\'obtenir l\'URL d\'authentification Google Calendar.')
        }
      } else {
        // Autre erreur
        console.error('Erreur lors de la génération du lien Google Meet:', result.error)
        alert(`Erreur lors de la génération du lien Google Meet: ${result.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la génération du lien Google Meet:', error)

      // Message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de la génération du lien Google Meet. ';

      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      }

      alert(errorMessage)
    } finally {
      setGeneratingMeet(false)
    }
  }

  const handleCreateMeeting = async () => {
    if (meetingDetails.date && meetingDetails.participants && meetingDetails.zoomLink) {
      try {
        // Créer la réunion directement dans notre base de données
        const meetingData = {
          title: meetingDetails.title || 'Réunion',
          date: meetingDetails.date,
          participants: meetingDetails.participants.split(',').map(email => email.trim()),
          meetingLink: meetingDetails.zoomLink,
        }

        console.log('Enregistrement de la réunion dans la base de données...')
        const dbResponse = await createMeeting(meetingData)
        console.log('Réunion créée dans la base de données:', dbResponse)

        // Rafraîchir la liste des prochaines réunions
        console.log('Rafraîchissement de la liste des prochaines réunions...')
        const upcomingResponse = await fetchUpcomingMeetings(3)
        if (upcomingResponse && upcomingResponse.success) {
          setUpcomingMeetings(upcomingResponse.meetings)
        }

        alert('Réunion ajoutée avec succès !')

        // Réinitialiser le formulaire
        setMeetingDetails({
          title: 'Réunion',
          date: '',
          participants: '',
          zoomLink: '',
        })
        setMeetLink('')
      } catch (error) {
        console.error('Erreur lors de la création de la réunion:', error)

        // Message d'erreur plus détaillé
        let errorMessage = 'Erreur lors de la création de la réunion. ';

        if (error.response?.data?.error) {
          errorMessage += error.response.data.error;
        } else if (error.message) {
          errorMessage += error.message;
        }

        alert(errorMessage)
      }
    } else {
      alert('Veuillez remplir tous les champs avant de créer la réunion.')
    }
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString('fr-FR', { month: 'short' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="meeting-container">
      {/* Header with icon */}
      <div className="meeting-header">
        <FaVideo className="meeting-icon" />
        <h2 className="meeting-title">Planifier une réunion</h2>
      </div>

      {/* Meeting form */}
      <div className="meeting-form">
        <div className="input-group">
          <FaCalendarAlt className="input-icon" />
          <input
            type="datetime-local"
            name="date"
            value={meetingDetails.date}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            name="participants"
            value={meetingDetails.participants}
            onChange={handleInputChange}
            placeholder="Emails séparés par des virgules"
            className="input-field"
          />
          <button
            type="button"
            className="import-users-btn"
            onClick={toggleUserList}
            title="Importer des utilisateurs"
          >
            <FaUsers />
          </button>

          {showUserList && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <h4>Sélectionner des utilisateurs</h4>
                <button
                  className="select-all-btn"
                  onClick={importAllUserEmails}
                >
                  Tout sélectionner
                </button>
              </div>

              {loading ? (
                <div className="loading-indicator">Chargement...</div>
              ) : users.length > 0 ? (
                <ul className="user-list">
                  {users.map(user => (
                    <li
                      key={user._id}
                      className="user-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-users">Aucun utilisateur trouvé</div>
              )}
            </div>
          )}
        </div>

        <div className="input-group">
          <FaLink className="input-icon" />
          <input
            type="text"
            name="zoomLink"
            value={meetingDetails.zoomLink}
            onChange={handleInputChange}
            placeholder="Lien de la réunion"
            className="input-field"
          />
          <button
            type="button"
            className="generate-meet-btn"
            onClick={generateGoogleMeetLink}
            disabled={generatingMeet || !meetingDetails.date}
            title="Générer un lien Google Meet"
          >
            {generatingMeet ? 'Génération...' : 'Générer Meet'}
          </button>
        </div>
      </div>

      {/* Note d'information sur l'API Google */}
      <div className="api-info">
        <p>
          <strong>Note:</strong> Pour utiliser la génération automatique de liens Google Meet, vous devez configurer votre propre projet Google Cloud Platform avec les API Calendar et Meet activées.
        </p>
      </div>

      {/* Create meeting button */}
      <button onClick={handleCreateMeeting} className="create-button">
        <FaPlus className="create-icon" />
        <span>Créer la Réunion</span>
      </button>

      {/* Upcoming meetings preview */}
      <div className="upcoming-meetings">
        <h3>Prochaines réunions</h3>
        {loadingMeetings ? (
          <div className="loading-indicator">Chargement des réunions...</div>
        ) : upcomingMeetings && upcomingMeetings.length > 0 ? (
          upcomingMeetings.map(meeting => {
            const formattedDate = formatDate(meeting.date)
            return (
              <div className="meeting-preview" key={meeting._id}>
                <div className="meeting-preview-date">
                  <div className="meeting-date">{formattedDate.day}</div>
                  <div className="meeting-month">{formattedDate.month}</div>
                </div>
                <div className="meeting-preview-details">
                  <div className="meeting-preview-title">{meeting.title}</div>
                  <div className="meeting-preview-time">{formattedDate.time}</div>
                  <div className="meeting-preview-participants">
                    {meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}
                  </div>
                  {meeting.meetingLink && (
                    <div className="meeting-preview-link">
                      <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                        Rejoindre la réunion
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="no-meetings">Aucune réunion à venir</div>
        )}
      </div>
    </div>
  )
}

export default MeetingScheduler
