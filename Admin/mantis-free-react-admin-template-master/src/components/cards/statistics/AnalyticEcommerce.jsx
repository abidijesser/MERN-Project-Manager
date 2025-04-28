import PropTypes from 'prop-types';
// material-ui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// project imports
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';

const iconSX = { fontSize: '0.875rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

export default function AnalyticEcommerce({ color = 'primary', title, count, percentage = 0, isLoss, extra }) {
  // Determine if percentage should be shown and its color
  const showPercentage = percentage !== null && percentage !== undefined;
  const percentageColor = isLoss ? 'error' : percentage > 0 ? 'success' : 'warning';
  const percentageIcon = isLoss || percentage < 0 ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />;
  const percentageValue = Math.abs(percentage).toFixed(1);
  const tooltipText =
    isLoss || percentage < 0
      ? `Decreased by ${percentageValue}% compared to previous period`
      : `Increased by ${percentageValue}% compared to previous period`;

  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h6" color="text.secondary" component="div">
          {title}
        </Typography>
        <Grid container alignItems="center">
          <Grid>
            <Typography variant="h4" color="inherit" component="div" sx={{ fontWeight: 600 }}>
              {count}
            </Typography>
          </Grid>
          {showPercentage && (
            <Grid>
              <Tooltip title={tooltipText} arrow placement="top">
                <Chip
                  variant="combined"
                  color={percentageColor}
                  icon={percentageIcon}
                  label={`${percentageValue}%`}
                  sx={{
                    ml: 1.25,
                    pl: 1,
                    '& .MuiChip-label': { px: 1 },
                    '& .MuiChip-icon': { mr: 0.5 }
                  }}
                  size="small"
                />
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </Stack>
      <Box sx={{ pt: 2.25 }}>
        <Typography variant="caption" color="text.secondary" component="div">
          You made an extra{' '}
          <Typography variant="caption" sx={{ color: `${color || 'primary'}.main`, fontWeight: 600 }} component="span">
            {extra}
          </Typography>{' '}
          this year
        </Typography>
      </Box>
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string
};
