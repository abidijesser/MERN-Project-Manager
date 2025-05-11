import { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardContent, Box, CircularProgress, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import SkeletonTotalGrowthBarChart from 'components/cards/Skeleton/TotalGrowthBarChart';
import api from 'utils/api';

// Définir gridSpacing si non disponible
const gridSpacing = 3;

// Import direct maintenant que la dépendance est installée
import Chart from 'react-apexcharts';

// ==============================|| USER STATISTICS PAGE ||============================== //

const Statistics = () => {
  const theme = useTheme();
  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Simulation de données pour le développement
      // Dans un environnement de production, décommentez la ligne ci-dessous
      // const response = await api.get('/stats/users');

      // Données simulées pour le développement
      const mockData = {
        success: true,
        stats: {
          users: {
            total: 25,
            recent: 5,
            roleDistribution: [
              { _id: 'Admin', count: 3 },
              { _id: 'Client', count: 22 }
            ],
            authMethods: [
              { _id: 'Traditional', count: 15 },
              { _id: 'Social', count: 10 }
            ]
          },
          projects: {
            total: 42,
            perUser: 1.68
          },
          tasks: {
            total: 10, // Updated to match the actual count from the screenshot
            perUser: 0.4 // Updated to reflect the correct ratio (10/25 = 0.4)
          }
        }
      };

      // Simuler un délai réseau
      setTimeout(() => {
        setStats(mockData.stats);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('An error occurred while fetching statistics');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Chart options for role distribution
  const roleChartOptions = {
    chart: {
      type: 'pie',
      height: 350
    },
    labels: stats?.users?.roleDistribution?.map((item) => item._id) || [],
    theme: {
      mode: theme.palette.mode
    },
    legend: {
      show: true,
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false
      }
    },
    tooltip: {
      theme: theme.palette.mode
    }
  };

  // Chart options for auth methods
  const authMethodsChartOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    labels: stats?.users?.authMethods?.map((item) => item._id) || [],
    theme: {
      mode: theme.palette.mode
    },
    legend: {
      show: true,
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false
      }
    },
    tooltip: {
      theme: theme.palette.mode
    }
  };

  return (
    <MainCard title="User Statistics">
      <Grid container spacing={gridSpacing}>
        {isLoading ? (
          <Grid item xs={12}>
            <SkeletonTotalGrowthBarChart />
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography color="error" variant="h4">
                  {error}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Total Users
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {stats?.users?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.users?.recent || 0} new users in the last 30 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Total Projects
                  </Typography>
                  <Typography variant="h3" color="secondary">
                    {stats?.projects?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. {stats?.projects?.perUser || 0} projects per user
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Total Tasks
                  </Typography>
                  <Typography variant="h3" color="warning.dark">
                    {stats?.tasks?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. {stats?.tasks?.perUser || 0} tasks per user
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Charts */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    User Role Distribution
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {stats?.users?.roleDistribution?.length > 0 ? (
                    <Chart
                      options={roleChartOptions}
                      series={stats.users.roleDistribution.map((item) => item.count)}
                      type="pie"
                      height={350}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                      <Typography variant="body1" color="text.secondary">
                        No role data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    Authentication Methods
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {stats?.users?.authMethods?.length > 0 ? (
                    <Chart
                      options={authMethodsChartOptions}
                      series={stats.users.authMethods.map((item) => item.count)}
                      type="donut"
                      height={350}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                      <Typography variant="body1" color="text.secondary">
                        No authentication data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </MainCard>
  );
};

export default Statistics;
