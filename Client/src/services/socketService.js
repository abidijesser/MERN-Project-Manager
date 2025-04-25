import io from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3001'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.listeners = {}
  }

  connect() {
    if (this.socket) return

    try {
      this.socket = io(SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true,
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id)
        this.connected = true
      })

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected')
        this.connected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        this.connected = false
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      // Set up default listeners
      this.setupDefaultListeners()
    } catch (error) {
      console.error('Error initializing socket connection:', error)
      this.socket = null
      this.connected = false
    }
  }

  setupDefaultListeners() {
    if (!this.socket) {
      console.warn('Cannot set up listeners: socket is null')
      return
    }

    // Listen for comment events
    this.socket.on('commentAdded', (comment) => {
      try {
        if (this.listeners.commentAdded) {
          this.listeners.commentAdded.forEach((callback) => callback(comment))
        }
      } catch (error) {
        console.error('Error in commentAdded listener:', error)
      }
    })

    // Listen for activity events
    this.socket.on('activityAdded', (activity) => {
      try {
        if (this.listeners.activityAdded) {
          this.listeners.activityAdded.forEach((callback) => callback(activity))
        }
      } catch (error) {
        console.error('Error in activityAdded listener:', error)
      }
    })

    // Listen for activity updates (for dashboard)
    this.socket.on('activityUpdated', (activity) => {
      try {
        if (this.listeners.activityUpdated) {
          this.listeners.activityUpdated.forEach((callback) => callback(activity))
        }
      } catch (error) {
        console.error('Error in activityUpdated listener:', error)
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  // Join a room for a specific task or project
  joinRoom(entityType, entityId) {
    try {
      if (!entityType || !entityId) {
        console.warn('Cannot join room: missing entityType or entityId')
        return
      }

      if (!this.socket || !this.connected) {
        this.connect()
      }

      const room = `${entityType}-${entityId}`
      if (this.socket && this.connected) {
        this.socket.emit('joinRoom', room)
        console.log(`Joined room: ${room}`)
      } else {
        console.warn(`Failed to join room ${room}: socket not connected`)
      }
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  // Leave a room
  leaveRoom(entityType, entityId) {
    try {
      if (!entityType || !entityId) {
        console.warn('Cannot leave room: missing entityType or entityId')
        return
      }

      if (!this.socket || !this.connected) return

      const room = `${entityType}-${entityId}`
      this.socket.emit('leaveRoom', room)
      console.log(`Left room: ${room}`)
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }

  // Send a new comment
  sendComment(comment) {
    try {
      if (!comment) {
        console.warn('Cannot send comment: missing comment data')
        return
      }

      if (!this.socket || !this.connected) {
        this.connect()
      }

      if (this.socket && this.connected) {
        this.socket.emit('newComment', comment)
      } else {
        console.warn('Failed to send comment: socket not connected')
      }
    } catch (error) {
      console.error('Error sending comment:', error)
    }
  }

  // Send a new activity log
  sendActivity(activity) {
    try {
      if (!activity) {
        console.warn('Cannot send activity: missing activity data')
        return
      }

      if (!this.socket || !this.connected) {
        this.connect()
      }

      if (this.socket && this.connected) {
        this.socket.emit('newActivity', activity)
      } else {
        console.warn('Failed to send activity: socket not connected')
      }
    } catch (error) {
      console.error('Error sending activity:', error)
    }
  }

  // Add event listener
  on(event, callback) {
    try {
      if (!event || typeof callback !== 'function') {
        console.warn('Invalid event listener parameters', { event, callback })
        return () => {}
      }

      if (!this.listeners[event]) {
        this.listeners[event] = []
      }

      this.listeners[event].push(callback)

      // If we're already connected, set up the socket listener
      if (this.socket && this.connected) {
        this.socket.on(event, callback)
      }

      return () => this.off(event, callback)
    } catch (error) {
      console.error('Error adding event listener:', error)
      return () => {}
    }
  }

  // Remove event listener
  off(event, callback) {
    try {
      if (!event || typeof callback !== 'function') {
        console.warn('Invalid event listener parameters for removal', { event, callback })
        return
      }

      if (!this.listeners[event]) return

      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)

      if (this.socket) {
        this.socket.off(event, callback)
      }
    } catch (error) {
      console.error('Error removing event listener:', error)
    }
  }
}

// Create a singleton instance
const socketService = new SocketService()

export default socketService
