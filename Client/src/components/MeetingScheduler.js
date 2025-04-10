import React, { useState } from 'react';
import { gapi } from 'gapi-script';
import { FaCalendarAlt, FaUser, FaLink, FaSmile, FaPaperclip } from 'react-icons/fa'; // Ajout d'icônes supplémentaires
import './MeetingScheduler.css'; // Assurez-vous de créer un fichier CSS pour le style

const CLIENT_ID = '550709886666-99v4ttngce40v6urhq0dli2i5dt2ie9g.apps.googleusercontent.com';
const API_KEY = 'pidev-455214';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const REDIRECT_URIS = ['http://localhost:3000'];

const MeetingScheduler = () => {
  const [meetingDetails, setMeetingDetails] = useState({
    date: '',
    participants: '',
    zoomLink: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleCreateMeeting = () => {
    if (meetingDetails.date && meetingDetails.participants && meetingDetails.zoomLink) {
      gapi.load('client:auth2', () => {
        gapi.client.init({ apiKey: API_KEY, clientId: CLIENT_ID, discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'], scope: SCOPES });
        gapi.client.load('calendar', 'v3', () => console.log('Google Calendar API chargée'));

        gapi.auth2.getAuthInstance().signIn().then(() => {
          const event = {
            summary: 'Réunion',
            description: `Participants : ${meetingDetails.participants}\nLien Zoom : ${meetingDetails.zoomLink}`,
            start: { dateTime: meetingDetails.date, timeZone: 'Europe/Paris' },
            end: { dateTime: new Date(new Date(meetingDetails.date).getTime() + 60 * 60 * 1000).toISOString(), timeZone: 'Europe/Paris' },
            attendees: meetingDetails.participants.split(',').map((email) => ({ email: email.trim() })),
          };

          gapi.client.calendar.events.insert({ calendarId: 'primary', resource: event }).then((response) => {
            console.log('Événement créé :', response);
            alert('Réunion ajoutée à Google Calendar !');
          }).catch((error) => {
            console.error('Erreur lors de la création de l’événement :', error);
            alert('Erreur lors de la création de la réunion.');
          });
        });
      });
    } else {
      alert('Veuillez remplir tous les champs avant de créer la réunion.');
    }
  };

  return (
    <div className="meeting-container">
      {/* Avatar et nom du chatbot */}
      <div className="chatbot-header">
        <img src="./assets/images/avatars/chat.png" alt="Chatbot Avatar" className="chatbot-avatar" />
        <h2 className="chatbot-name">Réunions</h2>
      </div>

      {/* Champs de saisie */}
      <div className="input-group">
        <FaCalendarAlt className="input-icon" />
        <input type="datetime-local" name="date" value={meetingDetails.date} onChange={handleInputChange} className="input-field" />
      </div>
      <div className="input-group">
        <FaUser className="input-icon" />
        <input type="text" name="participants" value={meetingDetails.participants} onChange={handleInputChange} placeholder="Emails séparés par des virgules" className="input-field" />
      </div>
      <div className="input-group">
        <FaLink className="input-icon" />
        <input type="text" name="zoomLink" value={meetingDetails.zoomLink} onChange={handleInputChange} placeholder="Lien Zoom" className="input-field" />
      </div>

      {/* Boutons de réponse rapide */}
      <div className="quick-replies">
        <button className="quick-reply">Aujourd'hui</button>
        <button className="quick-reply">Demain</button>
        <button className="quick-reply">Cette semaine</button>
      </div>

      {/* Bouton pour créer la réunion */}
      <button onClick={handleCreateMeeting} className="send-button">Créer la Réunion</button>
    </div>
  );
};

export default MeetingScheduler;
