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
      console.error('Error syncing tasks:', err);

      // Handle specific error codes
      if (err.response?.data?.code === 'REAUTHORIZATION_REQUIRED' || err.response?.data?.errorCode === 'INVALID_GRANT') {
        setError('Your Google Calendar authorization has expired. Please reconnect your account.');

        // Automatically remove the invalid token
        try {
          await api.post('/calendar/remove-token');
          console.log('Invalid token removed automatically');
        } catch (removeErr) {
          console.error('Error removing invalid token:', removeErr);
        }

        setIsAuthenticated(false); // Reset authentication status to trigger re-auth
      } else if (err.response?.data?.code === 'NOT_AUTHENTICATED') {
        setError('You are not authenticated with Google Calendar. Please connect your account first.');
        setIsAuthenticated(false);
      } else {
        setError('Failed to sync tasks with Google Calendar: ' + (err.response?.data?.error || err.message));
      }
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
      console.error('Error syncing projects:', err);

      // Handle specific error codes
      if (err.response?.data?.code === 'REAUTHORIZATION_REQUIRED' || err.response?.data?.errorCode === 'INVALID_GRANT') {
        setError('Your Google Calendar authorization has expired. Please reconnect your account.');

        // Automatically remove the invalid token
        try {
          await api.post('/calendar/remove-token');
          console.log('Invalid token removed automatically');
        } catch (removeErr) {
          console.error('Error removing invalid token:', removeErr);
        }

        setIsAuthenticated(false); // Reset authentication status to trigger re-auth
      } else if (err.response?.data?.code === 'NOT_AUTHENTICATED') {
        setError('You are not authenticated with Google Calendar. Please connect your account first.');
        setIsAuthenticated(false);
      } else {
        setError('Failed to sync projects with Google Calendar: ' + (err.response?.data?.error || err.message));
      }
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
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>Connected to Google Calendar</AlertTitle>
            Your account is connected to Google Calendar. You can now sync your tasks and projects.
          </Alert>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={async () => {
              try {
                setLoading(true);
                await api.post('/calendar/remove-token');
                setIsAuthenticated(false);
                setError(null);
                setTaskSyncResult(null);
                setProjectSyncResult(null);
              } catch (err) {
                console.error('Error removing token:', err);
                setError('Failed to disconnect from Google Calendar: ' + (err.response?.data?.error || err.message));
              } finally {
                setLoading(false);
              }
            }}
            startIcon={<LinkOutlined />}
            sx={{ mb: 2 }}
          >
            Disconnect from Google Calendar
          </Button>
        </Box>
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
            // Check if the URL already has parameters
            const separator = authUrl.includes('?') ? '&' : '?';
            const fullAuthUrl = `${authUrl}${separator}state=${stateParam}`;
            console.log('Full auth URL:', fullAuthUrl);

            // Store the current URL to redirect back after authentication
            localStorage.setItem('calendarAuthRedirectUrl', window.location.href);

            // Open in the same window to avoid popup blockers
            window.location.href = fullAuthUrl;
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
                  {/* Count successful and failed syncs */}
                  {(() => {
                    const successCount = taskSyncResult.results?.filter((r) => r.result.success).length || 0;
                    const failCount = taskSyncResult.results?.filter((r) => !r.result.success).length || 0;
                    const overallStatus = failCount === 0 ? 'success' : successCount > 0 ? 'warning' : 'error';

                    return (
                      <Alert severity={overallStatus}>
                        <AlertTitle>Sync Completed</AlertTitle>
                        {taskSyncResult.message}
                        {failCount > 0 && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {failCount} task(s) failed to sync. Check details below.
                          </Typography>
                        )}
                      </Alert>
                    );
                  })()}

                  {taskSyncResult.results && taskSyncResult.results.length > 0 && (
                    <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                      <List dense>
                        {taskSyncResult.results.map((result, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderLeft: '4px solid',
                              borderColor: result.result.success ? 'success.main' : 'error.main',
                              mb: 1
                            }}
                          >
                            <ListItemIcon>
                              {result.result.success ? (
                                <CheckCircleOutlined style={{ color: 'green' }} />
                              ) : (
                                <WarningOutlined style={{ color: 'red' }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={result.taskTitle}
                              secondary={
                                result.result.success ? (
                                  'Successfully synced'
                                ) : (
                                  <Typography component="span" color="error">
                                    Error: {result.result.error}
                                    {result.result.error === 'invalid_grant' &&
                                      ' - Your Google Calendar authorization has expired. Please reconnect your account.'}
                                  </Typography>
                                )
                              }
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
                  {/* Count successful and failed syncs */}
                  {(() => {
                    const successCount = projectSyncResult.results?.filter((r) => r.result.success).length || 0;
                    const failCount = projectSyncResult.results?.filter((r) => !r.result.success).length || 0;
                    const overallStatus = failCount === 0 ? 'success' : successCount > 0 ? 'warning' : 'error';

                    return (
                      <Alert severity={overallStatus}>
                        <AlertTitle>Sync Completed</AlertTitle>
                        {projectSyncResult.message}
                        {failCount > 0 && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {failCount} project(s) failed to sync. Check details below.
                          </Typography>
                        )}
                      </Alert>
                    );
                  })()}

                  {projectSyncResult.results && projectSyncResult.results.length > 0 && (
                    <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                      <List dense>
                        {projectSyncResult.results.map((result, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderLeft: '4px solid',
                              borderColor: result.result.success ? 'success.main' : 'error.main',
                              mb: 1
                            }}
                          >
                            <ListItemIcon>
                              {result.result.success ? (
                                <CheckCircleOutlined style={{ color: 'green' }} />
                              ) : (
                                <WarningOutlined style={{ color: 'red' }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={result.projectName}
                              secondary={
                                result.result.success ? (
                                  'Successfully synced'
                                ) : (
                                  <Typography component="span" color="error">
                                    Error: {result.result.error}
                                    {result.result.error === 'invalid_grant' &&
                                      ' - Your Google Calendar authorization has expired. Please reconnect your account.'}
                                  </Typography>
                                )
                              }
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
