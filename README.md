Project Management System

This project is a comprehensive Project Management System designed to streamline task management, resource allocation, and team collaboration. It includes a client-side application, an admin panel, and a server-side API to provide a seamless experience for managing projects, tasks, and resources.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

### Core Features
- **Project Management**: Create, edit, and manage projects with detailed information.
- **Task Management**: Assign tasks to team members, track progress, and set deadlines.
- **Resource Management**: Upload, organize, and share documents related to projects.
- **Collaboration**: Integrated chat system for team communication.
- **Performance Tracking**: Monitor project and task performance with visual dashboards.
- **Activity Logs**: Track changes and updates across projects and tasks.

### Advanced Features
- **AI-Powered Recommendations**: Suggest team members for tasks based on historical data.
- **Document Preview**: View documents directly in the application.
- **Role-Based Access Control**: Secure access to features based on user roles.
- **Notifications**: Real-time updates for task assignments, project changes, and deadlines.

---

## Project Structure
Project/
├── Admin/                         # Admin panel for managing the system
│   └── mantis-free-react-admin-template-master/
├── Client/                        # Client-side application
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── views/                 # Application views (dashboard, tasks, projects)
│   │   ├── utils/                 # Utility functions (e.g., Axios configuration)
│   │   └── App.js                 # Main application entry point
│   └── package.json              # Client dependencies and scripts
├── Server/                        # Server-side API
│   ├── controllers/              # API controllers
│   ├── models/                   # Database models (e.g., Project, Task, User)
│   ├── routes/                   # API routes
│   ├── scripts/                  # Utility scripts (e.g., seed data)
│   └── server.js                 # Main server entry point
├── docs/                          # Documentation
└── README.md                      # Project documentation


         
---

## Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (for database)
- **npm** or **yarn** (for package management)

### Steps
# Clone the repository
git clone https://github.com/abidijesser/MERN-Project-Manager.git
cd Project

# Install client dependencies
cd Client
npm install
# running 
npm start

# Install admin panel dependencies
cd ../Admin/mantis-free-react-admin-template-master
npm install
# running 
npm start


# Install server dependencies
cd ../../Server
npm install
# running 
npm run dev

Usage
Accessing the Applications
Client Application: http://localhost:3000

Admin Panel: http://localhost:3001/admin

login: http://localhost:3001/#/login

Key Functionalities
Client: Manage projects, tasks, and resources.

Admin: Oversee system-wide settings and user management.

Server: Handle API requests and database operations.



Technologies Used

Frontend
React: For building the user interface

CoreUI: Pre-designed UI components

Axios: For HTTP requests

Backend
Node.js: Server-side JavaScript runtime

Express.js: Web framework

MongoDB: NoSQL database

Other Tools
Socket.IO: Real-time communication

Chart.js: Data visualization

Flask & Python : Models development and integration

Toastify: Notifications
