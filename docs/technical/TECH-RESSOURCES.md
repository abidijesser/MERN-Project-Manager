# Documentation Technique : Module Ressources & Documents

## Architecture générale

Le module Ressources & Documents est conçu selon une architecture client-serveur avec séparation claire entre le frontend et le backend. Cette documentation détaille les aspects techniques de l'implémentation pour faciliter la maintenance et les évolutions futures.

## Table des matières

1. [Structure des fichiers](#1-structure-des-fichiers)
2. [Modèle de données](#2-modèle-de-données)
3. [API Backend](#3-api-backend)
4. [Composants Frontend](#4-composants-frontend)
5. [Gestion des fichiers](#5-gestion-des-fichiers)
6. [Système de permissions](#6-système-de-permissions)
7. [Optimisations et performances](#7-optimisations-et-performances)
8. [Sécurité](#8-sécurité)
9. [Tests](#9-tests)
10. [Évolutions futures](#10-évolutions-futures)

## 1. Structure des fichiers

### Backend

```
Server/
├── controllers/
│   └── documentController.js    # Logique métier pour les documents
├── models/
│   └── Document.js              # Modèle Mongoose pour les documents
├── routes/
│   └── documentRoutes.js        # Routes API pour les documents
└── utils/
    └── fileUpload.js            # Configuration de Multer pour l'upload
```

### Frontend

```
Client/src/
├── views/
│   └── resources/
│       ├── Resources.js         # Page principale des ressources
│       ├── DocumentUpload.js    # Composant de téléchargement
│       ├── Resources.css        # Styles spécifiques
│       └── README.md            # Documentation du module
├── components/
│   └── Documents/
│       └── ProjectDocuments.js  # Composant pour les documents de projet
└── utils/
    └── axios.js                 # Configuration Axios pour les requêtes API
```

## 2. Modèle de données

### Document (MongoDB)

```javascript
{
  name: String,                  // Nom du document
  description: String,           // Description optionnelle
  filePath: String,              // Chemin du fichier sur le serveur
  fileType: String,              // Extension/type du fichier
  fileSize: Number,              // Taille en octets
  project: ObjectId,             // Référence au projet associé
  uploadedBy: ObjectId,          // Référence à l'utilisateur qui a téléchargé
  uploadedDate: Date,            // Date de téléchargement
  lastModified: Date,            // Date de dernière modification
  pinned: Boolean,               // Statut d'épinglage
  isPublic: Boolean,             // Visibilité pour tous les utilisateurs
  permissions: [                 // Permissions spécifiques
    {
      user: ObjectId,            // Utilisateur concerné
      access: String             // Niveau d'accès (view, edit, admin)
    }
  ],
  versions: [                    // Historique des versions
    {
      filePath: String,          // Chemin de la version précédente
      fileSize: Number,          // Taille de la version
      uploadedBy: ObjectId,      // Qui a téléchargé cette version
      uploadedDate: Date,        // Quand cette version a été téléchargée
      comment: String            // Commentaire sur la version
    }
  ],
  comments: [ObjectId]           // Références aux commentaires
}
```

## 3. API Backend

### Points d'entrée

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | /api/documents | Récupérer tous les documents (avec filtres) | Requise |
| GET | /api/documents/:id | Récupérer un document spécifique | Requise |
| POST | /api/documents | Créer un nouveau document | Requise |
| PUT | /api/documents/:id | Mettre à jour un document | Requise |
| DELETE | /api/documents/:id | Supprimer un document | Requise |
| PUT | /api/documents/:id/permissions | Mettre à jour les permissions | Requise |
| POST | /api/documents/:id/versions | Ajouter une nouvelle version | Requise |
| PUT | /api/documents/:id/pin | Épingler/désépingler un document | Requise |

### Paramètres de requête

#### GET /api/documents
- `projectId` (optionnel) : Filtrer par projet
- `userId` (optionnel) : Filtrer par utilisateur
- `type` (optionnel) : Filtrer par type de document

#### POST /api/documents
- `document` (fichier) : Le fichier à télécharger
- `name` (optionnel) : Nom personnalisé
- `description` (optionnel) : Description du document
- `project` (optionnel) : ID du projet associé
- `isPublic` (optionnel) : Visibilité du document

## 4. Composants Frontend

### Resources.js

Composant principal qui gère :
- L'affichage de la liste des documents
- Le filtrage et la recherche
- La vue détaillée d'un document sélectionné
- Les actions sur les documents (télécharger, supprimer, etc.)

### DocumentUpload.js

Modal de téléchargement qui gère :
- La sélection de fichiers
- L'association à un projet
- Les métadonnées (description, visibilité)
- La progression du téléchargement

### ProjectDocuments.js

Composant intégré dans la page de détails du projet qui :
- Affiche les documents associés au projet
- Permet des actions rapides sur ces documents
- Offre un lien vers la gestion complète des ressources

## 5. Gestion des fichiers

### Stockage

Les fichiers sont stockés dans le système de fichiers du serveur :
- Répertoire de base : `public/uploads/documents`
- Nommage des fichiers : `{userId}-{timestamp}-{fileName}.{extension}`

### Upload avec Multer

Configuration de Multer pour gérer les téléchargements :
- Limite de taille : 50 MB par fichier
- Filtrage des types de fichiers autorisés
- Gestion des erreurs de téléchargement

### Téléchargement

Les fichiers sont servis directement depuis le serveur via une URL :
- Format : `http://192.168.33.10:3001/{filePath}`
- Pas de vérification d'authentification pour le téléchargement direct (à améliorer)

## 6. Système de permissions

### Niveaux d'accès

- **view** : Lecture seule (téléchargement)
- **edit** : Modification (ajout de versions)
- **admin** : Contrôle total (suppression, gestion des permissions)

### Logique d'attribution

1. Le créateur d'un document a automatiquement les droits `admin`
2. Les membres d'un projet ont accès `view` aux documents du projet
3. Les documents marqués comme publics sont accessibles en `view` par tous
4. Des permissions spécifiques peuvent être attribuées individuellement

### Vérification des permissions

Implémentée dans le contrôleur backend pour chaque opération :
```javascript
// Exemple de vérification pour l'édition
const hasPermission =
  document.uploadedBy.toString() === req.user.id ||
  document.permissions.some(
    (p) => p.user.toString() === req.user.id && ["edit", "admin"].includes(p.access)
  );

if (!hasPermission) {
  return res.status(403).json({
    success: false,
    error: "You don't have permission to update this document",
  });
}
```

## 7. Optimisations et performances

### Chargement des données

- Utilisation d'Axios pour les requêtes API
- Gestion des états de chargement avec spinners
- Mise en cache côté client pour les données fréquemment utilisées

### Pagination

À implémenter pour améliorer les performances avec un grand nombre de documents :
- Limite de documents par page
- Navigation entre les pages
- Chargement à la demande

### Optimisation des requêtes

- Utilisation de projections MongoDB pour limiter les données retournées
- Population sélective des références (utilisateurs, projets)
- Indexation des champs fréquemment utilisés pour la recherche

## 8. Sécurité

### Authentification

- Toutes les routes API nécessitent une authentification via JWT
- Middleware `auth` appliqué à toutes les routes de documents

### Validation des entrées

- Validation des données côté serveur avant traitement
- Sanitization des noms de fichiers et descriptions
- Vérification des types MIME pour les fichiers téléchargés

### Protection contre les attaques

- Limitation de la taille des fichiers
- Restriction des types de fichiers autorisés
- Validation des permissions pour chaque opération

## 9. Tests

### Tests unitaires à implémenter

- Validation du modèle Document
- Fonctions du contrôleur documentController
- Logique de permissions

### Tests d'intégration à implémenter

- Flux complet de téléchargement et récupération
- Gestion des permissions
- Intégration avec les projets

### Tests frontend à implémenter

- Rendu des composants
- Interactions utilisateur
- Gestion des erreurs

## 10. Évolutions futures

### Fonctionnalités planifiées

- **Prévisualisation avancée** : Intégration d'un visualiseur pour plus de types de fichiers
- **Versionnement amélioré** : Comparaison entre versions, restauration simplifiée
- **Recherche plein texte** : Indexation du contenu des documents pour une recherche avancée
- **Intégration cloud** : Support pour des services de stockage externes (S3, Google Drive)
- **Édition collaborative** : Modification en temps réel des documents

### Améliorations techniques

- Mise en place d'un CDN pour la distribution des fichiers
- Optimisation du stockage (déduplication, compression)
- Système de quotas par utilisateur ou projet
- Amélioration de la sécurité des téléchargements

---

## Notes pour les développeurs

- Respectez la structure existante lors de l'ajout de nouvelles fonctionnalités
- Documentez toute modification significative
- Suivez les conventions de nommage établies
- Testez soigneusement les modifications liées à la gestion des fichiers
- Consultez l'équipe avant de modifier le modèle de données
