import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { login, verify2FA } from 'utils/authUtils';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleTwoFactorSubmit = async () => {
    try {
      const result = await verify2FA(loginEmail, loginPassword, twoFactorCode);
      console.log('2FA verification result:', result);

      if (result.success) {
        // Check user role and redirect accordingly
        console.log('User role (2FA):', result.user?.role);
        if (result.user && result.user.role === 'Admin') {
          // Admin users go to the admin dashboard
          console.log('Redirecting to admin dashboard (2FA)');
          navigate('/dashboard/default');
        } else {
          // Non-admin users are not allowed to access the admin dashboard
          console.log('Access denied - not an admin user (2FA)');
          setLoginError('Access denied. Only Admin users can access this dashboard.');

          // Remove the token since we're denying access
          localStorage.removeItem('token');
        }
      } else {
        setLoginError(result.error || 'Invalid 2FA code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setLoginError('An error occurred during 2FA verification');
    }
  };

  return (
    <>
      {showTwoFactorInput ? (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="twoFactorCode">Enter 2FA Code</InputLabel>
              <OutlinedInput
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="Enter your 2FA code"
                fullWidth
              />
            </Stack>
            {loginError && (
              <FormHelperText error id="two-factor-error">
                {loginError}
              </FormHelperText>
            )}
          </Grid>
          <Grid size={12}>
            <AnimateButton>
              <Button fullWidth size="large" variant="contained" color="primary" onClick={handleTwoFactorSubmit}>
                Verify
              </Button>
            </AnimateButton>
          </Grid>
        </Grid>
      ) : (
        <Formik
          initialValues={{
            email: '',
            password: '',
            submit: null
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
            password: Yup.string()
              .required('Password is required')
              .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim())
              .max(10, 'Password must be less than 10 characters')
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              setLoginEmail(values.email);
              setLoginPassword(values.password);

              const result = await login(values.email, values.password);
              console.log('Login result:', result);

              if (result.success) {
                setStatus({ success: true });

                // Check user role and redirect accordingly
                console.log('User role:', result.user?.role);
                if (result.user && result.user.role === 'Admin') {
                  // Admin users go to the admin dashboard
                  console.log('Redirecting to admin dashboard');
                  navigate('/dashboard/default');
                } else {
                  // Non-admin users are not allowed to access the admin dashboard
                  console.log('Access denied - not an admin user');
                  setStatus({ success: false });
                  setErrors({ submit: 'Access denied. Only Admin users can access this dashboard.' });
                  setLoginError('Access denied. Only Admin users can access this dashboard.');

                  // Remove the token since we're denying access
                  localStorage.removeItem('token');
                }
              } else if (result.requires2FA) {
                setShowTwoFactorInput(true);
              } else {
                setStatus({ success: false });
                setErrors({ submit: result.error });
                setLoginError(result.error);
              }

              setSubmitting(false);
            } catch (err) {
              console.error(err);
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setLoginError(err.message);
              setSubmitting(false);
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
            <form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="email-login">Email Address</InputLabel>
                    <OutlinedInput
                      id="email-login"
                      type="email"
                      value={values.email}
                      name="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      fullWidth
                      error={Boolean(touched.email && errors.email)}
                    />
                  </Stack>
                  {touched.email && errors.email && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="password-login">Password</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.password && errors.password)}
                      id="-password-login"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            color="secondary"
                          >
                            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </IconButton>
                        </InputAdornment>
                      }
                      placeholder="Enter password"
                    />
                  </Stack>
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Grid>
                <Grid sx={{ mt: -1 }} size={12}>
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(event) => setChecked(event.target.checked)}
                          name="checked"
                          color="primary"
                          size="small"
                        />
                      }
                      label={<Typography variant="h6">Keep me sign in</Typography>}
                    />
                    <Link variant="h6" component={RouterLink} to="/forgot-password" color="text.primary">
                      Forgot Password?
                    </Link>
                  </Stack>
                </Grid>
                <Grid size={12}>
                  {loginError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {loginError}
                    </Alert>
                  )}
                  <AnimateButton>
                    <Button fullWidth size="large" variant="contained" color="primary" type="submit">
                      Login
                    </Button>
                  </AnimateButton>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      )}
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
