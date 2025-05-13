# Fonctionnalité Ressources & Documents

![Bannière Ressources & Documents](https://via.placeholder.com/1200x300/4a6baf/ffffff?text=Ressources+%26+Documents)

## Présentation

La fonctionnalité **Ressources & Documents** est un système complet de gestion documentaire intégré à notre application de gestion de projets. Elle permet aux équipes de centraliser, organiser et partager efficacement tous les documents liés à leurs projets.

## Table des matières

- [Fonctionnalités clés](#fonctionnalités-clés)
- [Captures d'écran](#captures-décran)
- [Guide d'utilisation](#guide-dutilisation)
- [Architecture technique](#architecture-technique)
- [Installation et configuration](#installation-et-configuration)
- [FAQ](#faq)

## Fonctionnalités clés

### 📁 Gestion documentaire complète
- Téléchargement de documents (jusqu'à 50 MB par fichier)
- Organisation par projet, type, date, etc.
- Prévisualisation intégrée des documents (PDF, images, texte, HTML)
- Téléchargement sécurisé
- Interface de visualisation intuitive avec zoom et navigation

### 🔄 Intégration avec les projets
- Association automatique des documents aux projets
- Affichage contextuel dans les détails du projet
- Filtrage par projet pour une recherche rapide

### 👥 Collaboration avancée
- Partage de documents entre membres d'équipe
- Partage externe via liens sécurisés avec options avancées :
  - Protection par mot de passe
  - Date d'expiration configurable
  - Niveaux d'accès personnalisables (lecture, commentaire, édition)
- Partage direct par email avec message personnalisé
- Système de permissions granulaires
- Épinglage des documents importants
- Historique des versions avec restauration

### 🔍 Recherche et organisation
- Filtrage multi-critères (type, date, auteur)
- Recherche par nom de document
- Tri personnalisable
- Documents épinglés pour un accès rapide

## Captures d'écran

*Les captures d'écran seront ajoutées après le déploiement de la fonctionnalité*

## Guide d'utilisation

### Accéder à la page Ressources

1. Connectez-vous à votre compte
2. Cliquez sur "Ressources" dans la barre de navigation principale
3. Vous accédez à la vue d'ensemble de tous les documents auxquels vous avez accès

### Télécharger un nouveau document

1. Depuis la page Ressources, cliquez sur "Ajouter un document"
2. Sélectionnez le(s) fichier(s) à télécharger
3. Choisissez le projet associé (optionnel)
4. Ajoutez une description (optionnel)
5. Définissez les paramètres de partage
6. Cliquez sur "Télécharger"

### Gérer les documents d'un projet

1. Accédez à la page de détails du projet concerné
2. Consultez la section "Documents du projet"
3. Utilisez les options disponibles pour chaque document (télécharger, partager, modifier, supprimer)
4. Cliquez sur "Gérer les documents" pour accéder à la vue complète des ressources filtrée pour ce projet

### Prévisualiser un document

1. Cliquez sur un document dans la liste ou sur l'option "Aperçu" dans le menu d'actions
2. Le document s'affiche dans la visionneuse intégrée (pour les formats compatibles)
3. Utilisez les contrôles de la visionneuse pour :
   - Zoomer/dézoomer
   - Naviguer entre les pages (pour les documents multi-pages)
   - Télécharger le document
   - Ouvrir dans un nouvel onglet
4. Pour les formats non prévisualisables, un message vous invite à télécharger le document

### Partager un document

1. Localisez le document à partager
2. Cliquez sur l'icône de partage dans le menu d'actions
3. Pour un partage interne :
   - Choisissez les membres de l'équipe
   - Définissez le niveau d'accès (lecture, commentaire, édition)
   - Validez le partage
4. Pour un partage externe via lien :
   - Cliquez sur "Créer un nouveau lien"
   - Configurez les options de sécurité :
     - Niveau d'accès (lecture, commentaire, édition)
     - Date d'expiration (1h, 24h, 7 jours, 30 jours ou jamais)
     - Protection par mot de passe (optionnel)
   - Copiez le lien généré ou envoyez-le directement par email
5. Pour partager par email :
   - Sélectionnez un lien de partage existant
   - Cliquez sur l'icône d'email
   - Renseignez l'adresse email et le nom du destinataire
   - Ajoutez un message personnalisé (optionnel)
   - Cliquez sur "Envoyer"

## Architecture technique

### Frontend
- React 18+
- CoreUI pour les composants d'interface
- Axios pour les requêtes API
- Socket.io pour les mises à jour en temps réel
- react-doc-viewer pour la prévisualisation des documents
- Système de gestion des liens de partage avec options avancées

### Backend
- Node.js avec Express
- API RESTful pour la gestion des documents
- Multer pour la gestion des téléchargements
- Système de permissions basé sur JWT
- Nodemailer pour l'envoi d'emails de partage
- Crypto-js pour la sécurisation des liens et mots de passe
- Modèle ShareLink pour la gestion des liens de partage

### Stockage
- Système de fichiers local (avec possibilité d'extension vers le cloud)
- MongoDB pour les métadonnées et références
- Structure optimisée pour la performance et la sécurité

## Installation et configuration

### Prérequis
- Node.js 14+
- MongoDB 4+
- Espace disque suffisant pour le stockage des documents

### Configuration du stockage
Le système utilise par défaut le répertoire `public/uploads/documents` pour stocker les fichiers. Assurez-vous que ce répertoire existe et dispose des permissions appropriées.

### Variables d'environnement
Ajoutez les variables suivantes à votre fichier `.env` côté serveur :
```
# Configuration des documents
MAX_FILE_SIZE=52428800  # 50MB en octets
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,jpg,jpeg,png,gif,zip,rar
DOCUMENT_STORAGE_PATH=public/uploads/documents

# Configuration des emails pour le partage
EMAIL_SERVICE=gmail  # ou autre service SMTP
EMAIL_USERNAME=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app

# Configuration des liens de partage
CLIENT_URL=http://192.168.33.10:3000  # URL de votre application client
```

Et dans votre fichier `.env` côté client :
```
VITE_API_URL=http://192.168.33.10:3001  # URL de votre API
```

## FAQ

### Quels types de fichiers sont supportés ?
Le système accepte la plupart des formats de documents bureautiques, images, et archives : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, PNG, GIF, ZIP, RAR.

### Quelle est la taille maximale des fichiers ?
La limite par défaut est de 50 MB par fichier.

### Comment fonctionnent les permissions ?
- Les créateurs d'un document ont automatiquement les droits d'édition et de suppression
- Les membres d'un projet ont accès en lecture aux documents du projet
- Des permissions spécifiques peuvent être attribuées individuellement

### Les documents sont-ils versionnés ?
Oui, le système conserve les versions précédentes des documents lorsqu'ils sont mis à jour.

### Est-il possible de prévisualiser les documents ?
Oui, la prévisualisation intégrée est disponible pour plusieurs types de fichiers :
- PDF : visualisation complète avec navigation entre pages et zoom
- Images (JPG, JPEG, PNG, GIF) : affichage direct avec zoom
- Texte (TXT) : affichage formaté
- HTML : rendu dans la visionneuse
D'autres formats nécessitent un téléchargement pour consultation.

### Comment fonctionnent les liens de partage ?
Les liens de partage permettent de donner accès à des documents à des personnes externes au système :
- Chaque lien peut avoir ses propres paramètres de sécurité
- Protection par mot de passe optionnelle
- Date d'expiration configurable (1h, 24h, 7 jours, 30 jours ou jamais)
- Niveaux d'accès personnalisables (lecture, commentaire, édition)
- Possibilité d'envoyer directement par email avec un message personnalisé
- Suivi des accès et désactivation possible à tout moment

---

© 2024 WebTrack | Tous droits réservés
