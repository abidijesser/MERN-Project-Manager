import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Alert,
  AlertTitle
} from '@mui/material';
import { CalendarOutlined, CheckCircleOutlined, SyncOutlined, WarningOutlined, LinkOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import api from 'utils/api';

const CalendarSync = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncingTasks, setSyncingTasks] = useState(false);
  const [syncingProjects, setSyncingProjects] = useState(false);
  const [taskSyncResult, setTaskSyncResult] = useState(null);
  const [projectSyncResult, setProjectSyncResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();

    // Check for success or error messages in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
      setIsAuthenticated(true);
      setError(null);
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setError(`Failed to authenticate with Google Calendar: ${error}`);
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking authentication status...');
      const response = await api.get('/calendar/check-auth');
      console.log('Auth status response:', response.data);
      setIsAuthenticated(response.data.isAuthenticated);

      if (!response.data.isAuthenticated) {
        console.log('User not authenticated, getting auth URL...');
        try {
          // Get auth URL
          const authUrlResponse = await api.get('/calendar/auth-url');
          console.log('Auth URL response:', authUrlResponse.data);
          setAuthUrl(authUrlResponse.data.authUrl);
        } catch (authUrlError) {
          console.error('Error getting auth URL:', authUrlError);
          setError('Failed to get authentication URL: ' + (authUrlError.response?.data?.error || authUrlError.message));
        }
      }
    } catch (err) {
      console.error('Error checking authentication status:', err);
      setError('Failed to check authentication status: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // No longer needed as we're handling the callback on the server side

  const handleSyncTasks = async () => {
    try {
      setSyncingTasks(true);
      const response = await api.post('/calendar/sync-tasks');
      setTaskSyncResult(response.data);
    } catch (err) {
      setError('Failed to sync tasks with Google Calendar');
      console.error(err);
    } finally {
      setSyncingTasks(false);
    }
  };

  const handleSyncProjects = async () => {
    try {
      setSyncingProjects(true);
      const response = await api.post('/calendar/sync-projects');
      setProjectSyncResult(response.data);
    } catch (err) {
      setError('Failed to sync projects with Google Calendar');
      console.error(err);
    } finally {
      setSyncingProjects(false);
    }
  };

  const renderAuthSection = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (isAuthenticated) {
      return (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Connected to Google Calendar</AlertTitle>
          Your account is connected to Google Calendar. You can now sync your tasks and projects.
        </Alert>
      );
    }

    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Google Calendar Authentication Required</AlertTitle>
        <Typography variant="body2" gutterBottom>
          To sync your tasks and projects with Google Calendar, you need to authenticate with your Google account.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<LinkOutlined />}
          onClick={() => {
            const userId = localStorage.getItem('userId');
            console.log('Connecting to Google Calendar with user ID:', userId);
            // Add userId as a state parameter to be preserved through the OAuth flow
            const stateParam = encodeURIComponent(JSON.stringify({ userId }));
            // Open in a new tab to avoid QUIC protocol errors
            const fullAuthUrl = `${authUrl}&state=${stateParam}`;
            console.log('Full auth URL:', fullAuthUrl);
            window.open(fullAuthUrl, '_blank');
          }}
          sx={{ mt: 2 }}
        >
          Connect to Google Calendar
        </Button>
      </Alert>
    );
  };

  const renderSyncSection = () => {
    if (!isAuthenticated) {
      return null;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Sync Tasks
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Sync your tasks with Google Calendar. This will create or update calendar events for your tasks.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={syncingTasks ? <CircularProgress size={20} color="inherit" /> : <SyncOutlined />}
                onClick={handleSyncTasks}
                disabled={syncingTasks}
                fullWidth
              >
                {syncingTasks ? 'Syncing...' : 'Sync Tasks'}
              </Button>

              {taskSyncResult && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success">
                    <AlertTitle>Sync Completed</AlertTitle>
                    {taskSyncResult.message}
                  </Alert>
                  {taskSyncResult.results && taskSyncResult.results.length > 0 && (
                    <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                      <List dense>
                        {taskSyncResult.results.map((result, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {result.result.success ? (
                                <CheckCircleOutlined style={{ color: 'green' }} />
                              ) : (
                                <WarningOutlined style={{ color: 'red' }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={result.taskTitle}
                              secondary={result.result.success ? 'Successfully synced' : `Error: ${result.result.error}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Sync Projects
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Sync your projects with Google Calendar. This will create or update calendar events for your projects.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={syncingProjects ? <CircularProgress size={20} color="inherit" /> : <SyncOutlined />}
                onClick={handleSyncProjects}
                disabled={syncingProjects}
                fullWidth
              >
                {syncingProjects ? 'Syncing...' : 'Sync Projects'}
              </Button>

              {projectSyncResult && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success">
                    <AlertTitle>Sync Completed</AlertTitle>
                    {projectSyncResult.message}
                  </Alert>
                  {projectSyncResult.results && projectSyncResult.results.length > 0 && (
                    <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                      <List dense>
                        {projectSyncResult.results.map((result, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {result.result.success ? (
                                <CheckCircleOutlined style={{ color: 'green' }} />
                              ) : (
                                <WarningOutlined style={{ color: 'red' }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={result.projectName}
                              secondary={result.result.success ? 'Successfully synced' : `Error: ${result.result.error}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <MainCard title="Google Calendar Sync">
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Sync your tasks and projects with Google Calendar to keep track of deadlines and important dates.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {renderAuthSection()}

      <Divider sx={{ my: 3 }} />

      {renderSyncSection()}
    </MainCard>
  );
};

export default CalendarSync;
