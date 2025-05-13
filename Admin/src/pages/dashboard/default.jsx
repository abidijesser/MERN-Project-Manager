import { useEffect, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import UpcomingDeadlinesCard from 'sections/dashboard/default/UpcomingDeadlinesCard';
import TaskDistributionCard from 'sections/dashboard/default/TaskDistributionCard';

// project management
import ProjectManagement from 'pages/project-management';

// task management
import TaskManagement from 'pages/task-management';

// API functions
import { getDashboardStats } from 'utils/dashboardApi';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  // State for dashboard statistics
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    tasksDueToday: 0,
    activeUsersToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard - Component mounted');

    // Check if there are token and role in URL parameters (from auth transfer)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlRole = urlParams.get('role');

    if (urlToken && urlRole) {
      console.log('Dashboard - Found token and role in URL parameters');
      // Store token and role in localStorage
      localStorage.setItem('token', urlToken);
      localStorage.setItem('userRole', urlRole);
      console.log('Dashboard - Stored token and role from URL parameters');

      // Remove parameters from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Check if user is authenticated and has admin role
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    console.log('Dashboard - Token exists:', !!token);
    console.log('Dashboard - User role:', userRole);

    if (!token) {
      console.log('Dashboard - No token found, will redirect');
      window.location.href = 'http://192.168.33.10:3000/#/login';
      return;
    }

    if (userRole !== 'Admin') {
      console.log('Dashboard - Not admin, will redirect');
      window.location.href = '/unauthorized';
      return;
    }

    console.log('Dashboard - Authentication verified');

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        console.log('Dashboard - Statistics fetched:', dashboardStats);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Dashboard - Error fetching statistics:', error);
        // Set default values in case of error
        setStats({
          totalProjects: 24,
          completedTasks: 124,
          tasksDueToday: 8,
          activeUsersToday: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();

    // Set up interval to refresh statistics every 5 minutes
    const intervalId = setInterval(fetchDashboardStats, 5 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5" component="div">
          Dashboard
        </Typography>
      </Grid>

      {/* WebTrack Statistics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
        {loading ? (
          <MainCard sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </MainCard>
        ) : (
          <AnalyticEcommerce
            title="Total Projects"
            count={stats.totalProjects.toString()}
            percentage={stats.projectGrowthPercent}
            isLoss={stats.projectGrowthPercent < 0}
            extra="Active projects"
            color="primary"
          />
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
        {loading ? (
          <MainCard sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </MainCard>
        ) : (
          <AnalyticEcommerce
            title="Completed Tasks"
            count={stats.completedTasks.toString()}
            percentage={stats.completedTasksGrowthPercent}
            isLoss={stats.completedTasksGrowthPercent < 0}
            extra="This month"
            color="success"
          />
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
        {loading ? (
          <MainCard sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </MainCard>
        ) : (
          <AnalyticEcommerce
            title="Tasks Due Today"
            count={stats.tasksDueToday.toString()}
            percentage={stats.tasksDueTodayGrowthPercent}
            isLoss={stats.tasksDueTodayGrowthPercent > 0}
            color={stats.tasksDueToday > 5 ? 'warning' : 'success'}
            extra="Requires attention"
          />
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
        {loading ? (
          <MainCard sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </MainCard>
        ) : (
          <AnalyticEcommerce
            title="Active Users Today"
            count={stats.activeUsersToday.toString()}
            percentage={stats.activeUsersGrowthPercent}
            isLoss={stats.activeUsersGrowthPercent < 0}
            color="info"
            extra="Team activity"
          />
        )}
      </Grid>
      {/* row 2 - Task Distribution Chart */}
      <Grid size={{ xs: 12 }}>
        <TaskDistributionCard />
      </Grid>

      {/* row 3 - Project Management */}
      <Grid size={{ xs: 12 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5" component="div">
              Project Management
            </Typography>
          </Grid>
          <Grid>
            <Button variant="contained" color="primary" onClick={() => (window.location.href = '/project-management')}>
              View All
            </Button>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 2 }}>
            <ProjectManagement dashboardView={true} />
          </Box>
        </MainCard>
      </Grid>

      {/* row 4 - Task Management */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5" component="div">
              Task Management
            </Typography>
          </Grid>
          <Grid>
            <Button variant="contained" color="primary" onClick={() => (window.location.href = '/task-management')}>
              View All
            </Button>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 2 }}>
            <TaskManagement dashboardView={true} />
          </Box>
        </MainCard>
      </Grid>

      {/* row 5 - Upcoming Deadlines */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5" component="div">
              Upcoming Deadlines
            </Typography>
          </Grid>
          <Grid />
        </Grid>
        <Box sx={{ mt: 2 }}>
          <UpcomingDeadlinesCard />
        </Box>
      </Grid>
    </Grid>
  );
}
