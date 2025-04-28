import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  Avatar
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import api from 'utils/api';

// assets
import { ClockCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

// ==============================|| UPCOMING DEADLINES CARD ||============================== //

const UpcomingDeadlinesCard = () => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingDeadlines = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/upcoming-deadlines');
        if (response.data.success) {
          setUpcomingTasks(response.data.tasks);
        }
      } catch (err) {
        setError('Failed to fetch upcoming deadlines');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingDeadlines();
    // Set up a timer to refresh the data periodically
    const intervalId = setInterval(fetchUpcomingDeadlines, 3600000); // Refresh every hour

    return () => clearInterval(intervalId);
  }, []);

  // Function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'error';
      case 'In Progress':
        return 'warning';
      case 'Done':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Function to get icon based on days remaining
  const getDeadlineIcon = (daysRemaining) => {
    if (daysRemaining <= 1) {
      return <WarningOutlined style={{ color: '#f44336' }} />;
    } else if (daysRemaining <= 3) {
      return <ClockCircleOutlined style={{ color: '#ff9800' }} />;
    } else {
      return <ClockCircleOutlined style={{ color: '#4caf50' }} />;
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <MainCard title="Upcoming Deadlines" content={false}>
      <CardContent sx={{ p: 0 }}>
        {loading && <LinearProgress />}
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error" component="div">
              {error}
            </Typography>
          </Box>
        )}
        {!loading && !error && upcomingTasks.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" component="div">
              No upcoming deadlines found
            </Typography>
          </Box>
        )}
        {!loading && !error && upcomingTasks.length > 0 && (
          <List
            component="nav"
            sx={{
              px: 0,
              py: 0,
              '& .MuiListItemButton-root': {
                py: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32
                }
              }
            }}
          >
            {upcomingTasks.map((task) => (
              <Box key={task._id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    borderLeft: `4px solid ${task.daysRemaining <= 1 ? '#f44336' : task.daysRemaining <= 3 ? '#ff9800' : '#4caf50'}`,
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        color: task.daysRemaining <= 1 ? 'error.main' : task.daysRemaining <= 3 ? 'warning.main' : 'success.main',
                        bgcolor: task.daysRemaining <= 1 ? 'error.lighter' : task.daysRemaining <= 3 ? 'warning.lighter' : 'success.lighter'
                      }}
                    >
                      {getDeadlineIcon(task.daysRemaining)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" component="span">
                          {task.title}
                        </Typography>
                        <Box sx={{ ml: 1, display: 'inline-flex' }}>
                          <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} sx={{ mr: 1 }} />
                          <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box component="span">
                          <Typography variant="caption" color="textSecondary" component="span">
                            Project: {task.project?.projectName || 'N/A'}
                          </Typography>
                        </Box>
                        <Box component="span">
                          <Typography variant="caption" color="textSecondary" component="span">
                            Assigned to: {task.assignedTo?.name || 'N/A'}
                          </Typography>
                        </Box>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            component="span"
                            color={task.daysRemaining <= 1 ? 'error.main' : task.daysRemaining <= 3 ? 'warning.main' : 'success.main'}
                          >
                            Due in {task.daysRemaining} {task.daysRemaining === 1 ? 'day' : 'days'} ({formatDate(task.dueDate)})
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        )}
      </CardContent>
      <Divider />
      <Grid container justifyContent="space-between" sx={{ p: 2 }}>
        <Grid item>
          <Typography variant="caption" color="secondary" component="div">
            Showing {upcomingTasks.length} upcoming deadlines
          </Typography>
        </Grid>
        <Grid item>
          <Button component={Link} to="/task-management" size="small" color="primary">
            View All Tasks
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default UpcomingDeadlinesCard;
