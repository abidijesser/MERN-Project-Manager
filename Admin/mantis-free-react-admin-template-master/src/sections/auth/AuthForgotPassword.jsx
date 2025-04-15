import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import api from 'utils/api';

// ============================|| FORGOT PASSWORD ||============================ //

export default function AuthForgotPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    success: false,
    error: false,
    message: ''
  });
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            setLoading(true);
            const response = await api.post('/auth/forgot-password', { email: values.email });

            if (response.data.success) {
              // Always show a generic success message for security reasons
              const successMessage =
                'Password reset link has been sent to your email address. Please check your inbox and follow the instructions in the email.';

              setStatus({
                success: true,
                error: false,
                message: successMessage
              });
              setSubmitting(false);
            } else {
              setStatus({
                success: false,
                error: true,
                message: response.data.error || 'Something went wrong. Please try again.'
              });
              setErrors({ submit: response.data.error });
              setSubmitting(false);
            }
          } catch (error) {
            console.error('Forgot password error:', error);
            setStatus({
              success: false,
              error: true,
              message: error.response?.data?.error || 'Something went wrong. Please try again.'
            });
            setErrors({ submit: error.response?.data?.error || 'Something went wrong. Please try again.' });
            setSubmitting(false);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            {status.success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {status.message}
              </Alert>
            )}

            {status.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {status.message}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-forgot">Email Address</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-forgot"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    inputProps={{}}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-forgot">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid size={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={loading}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </AnimateButton>
              </Grid>

              <Grid size={12}>
                <Typography variant="caption" align="center">
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
