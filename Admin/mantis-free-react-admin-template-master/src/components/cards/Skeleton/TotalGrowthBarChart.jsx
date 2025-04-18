import PropTypes from 'prop-types';

// material-ui
import { Card, CardContent, Grid, Skeleton } from '@mui/material';

// ==============================|| SKELETON - TOTAL GROWTH BAR CHART ||============================== //

const TotalGrowthBarChart = ({ ...others }) => (
  <Card {...others}>
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item>
              <Skeleton variant="rectangular" width={120} height={20} />
            </Grid>
            <Grid item>
              <Skeleton variant="rectangular" width={30} height={20} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalGrowthBarChart;
