import React, { useState, useEffect } from 'react'
import {
  FaCalendarAlt,
  FaUser,
  FaLink,
  FaVideo,
  FaClock,
  FaPlus,
  FaCheck,
  FaHourglassEnd,
} from 'react-icons/fa'
import './MeetingScheduler.css'

const MeetingScheduler = () => {
  const [meetingDetails, setMeetingDetails] = useState({
    date: '',
    duration: 60, // durée par défaut en minutes
    participants: '',
    zoomLink: '',
    title: "Réunion d'équipe",
  })
  const [success, setSuccess] = useState(false)
  const [meetings, setMeetings] = useState([])

  // Charger les réunions depuis le localStorage au démarrage
  useEffect(() => {
    const savedMeetings = localStorage.getItem('meetings')
    if (savedMeetings) {
      try {
        const parsedMeetings = JSON.parse(savedMeetings)
        // Convertir les chaînes de date en objets Date
        const formattedMeetings = parsedMeetings.map((meeting) => ({
          ...meeting,
          startDate: new Date(meeting.startDate),
          endDate: new Date(meeting.endDate),
        }))
        setMeetings(formattedMeetings)
      } catch (error) {
        console.error('Erreur lors du chargement des réunions:', error)
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMeetingDetails((prevDetails) => ({ ...prevDetails, [name]: value }))
  }

  const handleCreateMeeting = () => {
    if (meetingDetails.date && meetingDetails.participants && meetingDetails.zoomLink) {
      // Calculer la date de début et de fin
      const startDate = new Date(meetingDetails.date)
      const endDate = new Date(startDate.getTime())
      endDate.setMinutes(endDate.getMinutes() + parseInt(meetingDetails.duration))

      // Créer un objet réunion
      const meeting = {
        id: Date.now(), // identifiant unique basé sur le timestamp
        title: meetingDetails.title,
        startDate: startDate,
        endDate: endDate,
        duration: parseInt(meetingDetails.duration),
        participants: meetingDetails.participants.split(',').map((email) => email.trim()),
        zoomLink: meetingDetails.zoomLink,
      }

      console.log('Réunion créée :', meeting)

      // Ajouter la réunion à la liste
      const updatedMeetings = [...meetings, meeting]
      setMeetings(updatedMeetings)

      // Sauvegarder dans le localStorage
      localStorage.setItem('meetings', JSON.stringify(updatedMeetings))

      // Afficher un message de succès
      setSuccess(true)

      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setMeetingDetails({
          date: '',
          duration: 60,
          participants: '',
          zoomLink: '',
          title: "Réunion d'équipe",
        })
        setSuccess(false)
      }, 3000)
    } else {
      alert('Veuillez remplir tous les champs avant de créer la réunion.')
    }
  }

  // Fonction pour formater l'heure (HH:MM)
  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  // Fonction pour obtenir le jour et le mois
  const getDay = (date) => {
    return date.getDate()
  }

  const getMonth = (date) => {
    const months = [
      'JAN',
      'FÉV',
      'MAR',
      'AVR',
      'MAI',
      'JUIN',
      'JUIL',
      'AOÛ',
      'SEP',
      'OCT',
      'NOV',
      'DÉC',
    ]
    return months[date.getMonth()]
  }

  // Fonction pour définir la date à aujourd'hui
  const setToday = () => {
    const today = new Date()
    today.setHours(today.getHours() + 1)
    today.setMinutes(0)

    const formattedDate = today.toISOString().slice(0, 16)
    setMeetingDetails((prev) => ({ ...prev, date: formattedDate }))
  }

  // Fonction pour définir la date à demain
  const setTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10)
    tomorrow.setMinutes(0)

    const formattedDate = tomorrow.toISOString().slice(0, 16)
    setMeetingDetails((prev) => ({ ...prev, date: formattedDate }))
  }

  // Fonction pour définir la date à cette semaine (vendredi)
  const setThisWeek = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + 7 - dayOfWeek

    const friday = new Date()
    friday.setDate(today.getDate() + daysUntilFriday)
    friday.setHours(14)
    friday.setMinutes(0)

    const formattedDate = friday.toISOString().slice(0, 16)
    setMeetingDetails((prev) => ({ ...prev, date: formattedDate }))
  }

  return (
    <div className="meeting-container">
      {/* Header with icon */}
      <div className="meeting-header">
        <FaVideo className="meeting-icon" />
        <h2 className="meeting-title">Planifier une réunion</h2>
      </div>

      {/* Success message */}
      {success && (
        <div className="success-message">
          <FaCheck className="success-icon" />
          <span>Réunion créée avec succès!</span>
        </div>
      )}

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
          <FaHourglassEnd className="input-icon" />
          <input
            type="number"
            name="duration"
            value={meetingDetails.duration}
            onChange={handleInputChange}
            placeholder="Durée en minutes"
            className="input-field"
            min="15"
            step="15"
          />
        </div>

        <div className="input-group">
          <FaVideo className="input-icon" />
          <input
            type="text"
            name="title"
            value={meetingDetails.title}
            onChange={handleInputChange}
            placeholder="Titre de la réunion"
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
        </div>

        <div className="input-group">
          <FaLink className="input-icon" />
          <input
            type="text"
            name="zoomLink"
            value={meetingDetails.zoomLink}
            onChange={handleInputChange}
            placeholder="Lien Zoom/Meet"
            className="input-field"
          />
        </div>
      </div>

      {/* Quick date selection */}
      <div className="quick-replies">
        <button className="quick-reply" onClick={setToday}>
          <FaClock className="quick-reply-icon" />
          <span>Aujourd'hui</span>
        </button>
        <button className="quick-reply" onClick={setTomorrow}>
          <FaClock className="quick-reply-icon" />
          <span>Demain</span>
        </button>
        <button className="quick-reply" onClick={setThisWeek}>
          <FaClock className="quick-reply-icon" />
          <span>Cette semaine</span>
        </button>
      </div>

      {/* Create meeting button */}
      <button onClick={handleCreateMeeting} className="create-button" disabled={success}>
        <FaPlus className="create-icon" />
        <span>Créer la Réunion</span>
      </button>

      {/* Upcoming meetings preview */}
      <div className="upcoming-meetings">
        <h3>Prochaines réunions</h3>

        {meetings.length === 0 ? (
          <div className="no-meetings">Aucune réunion planifiée</div>
        ) : (
          meetings
            .sort((a, b) => a.startDate - b.startDate) // Trier par date
            .map((meeting) => (
              <div className="meeting-preview" key={meeting.id}>
                <div className="meeting-preview-date">
                  <div className="meeting-date">{getDay(meeting.startDate)}</div>
                  <div className="meeting-month">{getMonth(meeting.startDate)}</div>
                </div>
                <div className="meeting-preview-details">
                  <div className="meeting-preview-title">{meeting.title}</div>
                  <div className="meeting-preview-time">
                    {formatTime(meeting.startDate)} - {formatTime(meeting.endDate)}
                  </div>
                  <div className="meeting-preview-participants">
                    {meeting.participants.length} participant
                    {meeting.participants.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default MeetingScheduler
