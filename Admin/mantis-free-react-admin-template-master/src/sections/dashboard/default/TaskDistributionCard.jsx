import PropTypes from 'prop-types';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import TaskDistributionChart from './TaskDistributionChart';

// ==============================|| TASK DISTRIBUTION CARD ||============================== //

const TaskDistributionCard = () => {
  return (
    <MainCard content={false}>
      <Grid container sx={{ p: 2, pb: 0 }}>
        <Grid item xs={12}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5" component="div">
                Tasks by Project and Status
              </Typography>
            </Grid>
            <Grid item />
          </Grid>
        </Grid>
      </Grid>
      <TaskDistributionChart />
    </MainCard>
  );
};

export default TaskDistributionCard;
