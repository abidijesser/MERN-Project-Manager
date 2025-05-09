# Tableau de Bord de Performance - Documentation

Ce document explique les fonctionnalités du tableau de bord de performance, les formules utilisées pour les calculs, et comment tester l'application.

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Formules et calculs](#formules-et-calculs)
3. [Guide de test](#guide-de-test)
4. [Architecture technique](#architecture-technique)
5. [Dépannage](#dépannage)

## Fonctionnalités

Le tableau de bord de performance offre les fonctionnalités suivantes :

### 1. Vue d'ensemble des KPIs

- **Taux d'avancement (%)** : Pourcentage global d'achèvement des projets
- **Efficacité temporelle** : Mesure de l'efficacité par rapport aux délais prévus
- **Projets à risque** : Nombre de projets identifiés comme étant à risque
- **Risques détectés** : Nombre total de risques identifiés dans tous les projets

### 2. Visualisations graphiques

- **Graphique de performance des projets** : Comparaison des taux d'achèvement, d'efficacité et de risque pour chaque projet
- **Répartition des statuts de projets** : Diagramme circulaire montrant la distribution des projets par statut (terminés, en cours, en retard, à risque)

### 3. Filtrage des données

- **Filtre par projet** : Sélection d'un projet spécifique pour analyse détaillée
- **Filtre par période** : Sélection d'une plage de dates pour analyser les performances sur une période spécifique
- **Réinitialisation des filtres** : Option pour effacer tous les filtres appliqués

### 4. Analyse détaillée des projets

- **Table de performance** : Affichage détaillé des métriques de performance pour chaque projet
- **Vue détaillée par projet** : Modal avec informations détaillées sur un projet spécifique, incluant :
  - Informations générales (taux d'achèvement, efficacité, risque, utilisation des ressources)
  - Détails des tâches (nombre total, terminées, en retard)
  - Analyse de performance avec graphique radar

### 5. Recommandations IA

- Suggestions automatiques basées sur l'analyse des données
- Identification des projets à risque
- Recommandations pour améliorer l'efficacité
- Mise en évidence des bonnes pratiques des projets performants

### 6. Export de données

- **Export PDF** : Génération d'un rapport PDF avec toutes les métriques de performance
- **Export CSV** : Export des données brutes au format CSV pour analyse externe

## Formules et calculs

Les métriques de performance sont calculées selon les formules suivantes :

### Taux d'achèvement

```
Taux d'achèvement (%) = (Nombre de tâches terminées / Nombre total de tâches) × 100
```

### Efficacité temporelle

```
Efficacité temporelle (%) = (Durée planifiée / Durée réelle) × 100
```
- Si le résultat est > 100%, il est plafonné à 100%
- Une valeur élevée indique une bonne efficacité temporelle

### Niveau de risque

```
Niveau de risque (%) = (Nombre de tâches en retard / Nombre total de tâches) × 100
```
- Une valeur élevée indique un niveau de risque important

### Statut du projet

Le statut d'un projet est déterminé selon les règles suivantes :
- **Terminé** : Si le statut du projet est "Completed" ou "Archived"
- **À risque** : Si le niveau de risque est > 30%
- **En retard** : Si l'efficacité temporelle est < 70%
- **En cours** : Dans tous les autres cas

### KPIs globaux

- **Taux d'avancement moyen** : Moyenne des taux d'achèvement de tous les projets
- **Efficacité temporelle moyenne** : Moyenne des efficacités temporelles de tous les projets
- **Total des risques** : Somme de toutes les tâches en retard dans tous les projets
- **Projets à risque** : Nombre de projets ayant un statut "à risque"

## Guide de test

Pour tester le tableau de bord de performance, suivez ces étapes :

### Prérequis

1. Assurez-vous que le serveur backend est en cours d'exécution
2. Assurez-vous que la base de données contient des projets et des tâches

### Étapes de test

1. **Accès au tableau de bord**
   - Connectez-vous à l'application
   - Naviguez vers la section "Performances" dans le menu principal

2. **Test des filtres**
   - Sélectionnez un projet spécifique dans le menu déroulant
   - Vérifiez que les données affichées correspondent au projet sélectionné
   - Sélectionnez une plage de dates
   - Cliquez sur "Filtrer" et vérifiez que les données sont filtrées correctement
   - Cliquez sur "Réinitialiser" pour effacer les filtres

3. **Test de la vue détaillée**
   - Dans la table des projets, cliquez sur le bouton "Détails" pour un projet
   - Vérifiez que la modal s'ouvre avec les informations correctes
   - Naviguez entre les différents onglets (Informations générales, Tâches, Analyse de performance)
   - Fermez la modal

4. **Test des exports**
   - Cliquez sur le bouton "Exporter en PDF"
   - Vérifiez que le fichier PDF est généré correctement
   - Cliquez sur le bouton "Exporter en CSV"
   - Vérifiez que le fichier CSV est généré correctement et contient toutes les données

5. **Vérification des calculs**
   - Comparez manuellement quelques métriques affichées avec les formules décrites ci-dessus
   - Vérifiez que les statuts des projets sont correctement attribués selon les règles définies

## Architecture technique

Le tableau de bord de performance est construit avec les technologies suivantes :

- **Frontend** : React.js avec Ant Design pour les composants UI
- **Visualisation** : Recharts pour les graphiques
- **Backend** : Node.js avec Express
- **Base de données** : MongoDB

### Structure des fichiers clés

- `Client/src/views/Performances/Performances.js` : Composant principal du tableau de bord
- `Client/src/services/performanceService.js` : Service pour récupérer et traiter les données de performance

## Dépannage

### Problèmes courants

1. **Les données ne se chargent pas**
   - Vérifiez que le serveur backend est en cours d'exécution
   - Vérifiez la console du navigateur pour les erreurs
   - Assurez-vous que vous êtes authentifié (token valide)

2. **Les filtres ne fonctionnent pas**
   - Vérifiez que vous avez cliqué sur le bouton "Filtrer" après avoir sélectionné les filtres
   - Vérifiez que les projets ont des dates de début et de fin valides

3. **Les exports échouent**
   - Vérifiez que vous avez les permissions nécessaires pour télécharger des fichiers
   - Vérifiez la console du navigateur pour les erreurs

4. **Les graphiques ne s'affichent pas correctement**
   - Assurez-vous que la fenêtre du navigateur est suffisamment large
   - Essayez de rafraîchir la page

---

Pour toute question ou problème supplémentaire, veuillez contacter l'équipe de développement.
