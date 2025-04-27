import React, { useState } from 'react'
import { gapi } from 'gapi-script'
import { FaCalendarAlt, FaUser, FaLink, FaVideo, FaClock, FaPlus } from 'react-icons/fa'
import './MeetingScheduler.css'

const CLIENT_ID = '550709886666-99v4ttngce40v6urhq0dli2i5dt2ie9g.apps.googleusercontent.com'
const API_KEY = 'pidev-455214'
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'
const REDIRECT_URIS = ['http://localhost:3000']

const MeetingScheduler = () => {
  const [meetingDetails, setMeetingDetails] = useState({
    date: '',
    participants: '',
    zoomLink: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMeetingDetails((prevDetails) => ({ ...prevDetails, [name]: value }))
  }

  const handleCreateMeeting = () => {
    if (meetingDetails.date && meetingDetails.participants && meetingDetails.zoomLink) {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: SCOPES,
        })
        gapi.client.load('calendar', 'v3', () => console.log('Google Calendar API chargée'))

        gapi.auth2
          .getAuthInstance()
          .signIn()
          .then(() => {
            const event = {
              summary: 'Réunion',
              description: `Participants : ${meetingDetails.participants}\nLien Zoom : ${meetingDetails.zoomLink}`,
              start: { dateTime: meetingDetails.date, timeZone: 'Europe/Paris' },
              end: {
                dateTime: new Date(
                  new Date(meetingDetails.date).getTime() + 60 * 60 * 1000,
                ).toISOString(),
                timeZone: 'Europe/Paris',
              },
              attendees: meetingDetails.participants
                .split(',')
                .map((email) => ({ email: email.trim() })),
            }

            gapi.client.calendar.events
              .insert({ calendarId: 'primary', resource: event })
              .then((response) => {
                console.log('Événement créé :', response)
                alert('Réunion ajoutée à Google Calendar !')
              })
              .catch((error) => {
                console.error('Erreur lors de la création de l’événement :', error)
                alert('Erreur lors de la création de la réunion.')
              })
          })
      })
    } else {
      alert('Veuillez remplir tous les champs avant de créer la réunion.')
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
        </div>

        <div className="input-group">
          <FaLink className="input-icon" />
          <input
            type="text"
            name="zoomLink"
            value={meetingDetails.zoomLink}
            onChange={handleInputChange}
            placeholder="Lien Zoom"
            className="input-field"
          />
        </div>
      </div>

      {/* Quick date selection */}
      <div className="quick-replies">
        <button className="quick-reply">
          <FaClock className="quick-reply-icon" />
          <span>Aujourd'hui</span>
        </button>
        <button className="quick-reply">
          <FaClock className="quick-reply-icon" />
          <span>Demain</span>
        </button>
        <button className="quick-reply">
          <FaClock className="quick-reply-icon" />
          <span>Cette semaine</span>
        </button>
      </div>

      {/* Create meeting button */}
      <button onClick={handleCreateMeeting} className="create-button">
        <FaPlus className="create-icon" />
        <span>Créer la Réunion</span>
      </button>

      {/* Upcoming meetings preview */}
      <div className="upcoming-meetings">
        <h3>Prochaines réunions</h3>
        <div className="meeting-preview">
          <div className="meeting-preview-date">
            <div className="meeting-date">25</div>
            <div className="meeting-month">Nov</div>
          </div>
          <div className="meeting-preview-details">
            <div className="meeting-preview-title">Réunion d'équipe</div>
            <div className="meeting-preview-time">14:00 - 15:00</div>
            <div className="meeting-preview-participants">5 participants</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingScheduler
