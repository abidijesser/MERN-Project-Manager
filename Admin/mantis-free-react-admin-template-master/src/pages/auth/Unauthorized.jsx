import { Link } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import AuthWrapper from 'sections/auth/AuthWrapper';

// ================================|| UNAUTHORIZED ||================================ //

export default function Unauthorized() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" justifyContent="center" alignItems="center">
            <Stack spacing={1} justifyContent="center" alignItems="center">
              <Typography variant="h1">403</Typography>
              <Typography variant="h6">Unauthorized Access</Typography>
              <Typography color="textSecondary" align="center">
                You do not have permission to access this page. This area is restricted to administrators only.
              </Typography>
              <AnimateButton>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  onClick={() => {
                    // Redirect to client login page
                    window.location.href = 'http://localhost:3000/#/login';
                  }}
                >
                  Back to Login
                </Button>
              </AnimateButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
