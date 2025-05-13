import { useState, useEffect, useRef } from 'react';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar,
  Stack
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import api from 'utils/api';
import { getCurrentUser } from 'utils/authUtils';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import CameraOutlined from '@ant-design/icons/CameraOutlined';

// ==============================|| PROFILE PAGE ||============================== //

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setFormData({
            ...formData,
            name: userData.name || '',
            email: userData.email || ''
          });

          // Set profile picture if available
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching user data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);

      // Validate form data
      if (!formData.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Name is required',
          severity: 'error'
        });
        setSaving(false);
        return;
      }

      // Create data object for API call
      const updateData = {
        name: formData.name.trim()
      };

      // Make API call to update profile
      const response = await api.put(`/auth/profile/${user._id}`, updateData);

      if (response.data.success) {
        // Update local user data
        const updatedUser = response.data.user;
        setUser({
          ...user,
          name: updatedUser.name
        });

        // Update form data
        setFormData({
          ...formData,
          name: updatedUser.name,
          email: updatedUser.email
        });

        // Update localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.name = updatedUser.name;
            localStorage.setItem('user', JSON.stringify(parsedUser));
            localStorage.setItem('userName', updatedUser.name);
          } catch (error) {
            console.error('Error updating user data in localStorage:', error);
          }
        }

        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error updating profile',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error updating profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSaving(true);

      // Validate password data
      if (!formData.currentPassword) {
        setSnackbar({
          open: true,
          message: 'Current password is required',
          severity: 'error'
        });
        setSaving(false);
        return;
      }

      if (!formData.newPassword) {
        setSnackbar({
          open: true,
          message: 'New password is required',
          severity: 'error'
        });
        setSaving(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setSnackbar({
          open: true,
          message: 'New passwords do not match',
          severity: 'error'
        });
        setSaving(false);
        return;
      }

      // Create data object for API call
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      // Make API call to change password
      const response = await api.post('/auth/change-password', passwordData);

      if (response.data.success) {
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        setSnackbar({
          open: true,
          message: 'Password changed successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error changing password',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error changing password',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleProfilePictureClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: 'Please select a valid image file (JPEG, PNG, or GIF)',
        severity: 'error'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setSnackbar({
        open: true,
        message: 'Image size should be less than 5MB',
        severity: 'error'
      });
      return;
    }

    try {
      setUploading(true);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Upload the file
      const response = await api.post('/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update profile picture state
        setProfilePicture(response.data.profilePicture);

        // Update user state
        setUser({
          ...user,
          profilePicture: response.data.profilePicture
        });

        setSnackbar({
          open: true,
          message: 'Profile picture updated successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error uploading profile picture',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error uploading profile picture',
        severity: 'error'
      });
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainCard title="My Profile">
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Profile Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Profile Picture */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profilePicture ? `http://192.168.33.10:3001/${profilePicture}` : ''}
                    sx={{
                      width: 100,
                      height: 100,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                    onClick={handleProfilePictureClick}
                  >
                    {!profilePicture && (user ? user.name.charAt(0).toUpperCase() : 'U')}
                  </Avatar>

                  {/* Hidden file input */}
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

                  {/* Camera icon overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark'
                      }
                    }}
                    onClick={handleProfilePictureClick}
                  >
                    <CameraOutlined />
                  </Box>
                </Box>
              </Box>

              {/* Upload status */}
              {uploading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography variant="body2">Uploading...</Typography>
                  </Stack>
                </Box>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UserOutlined />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlined />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveOutlined />}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="toggle password visibility">
                            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showNewPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleChangePassword}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveOutlined />}
                  >
                    {saving ? 'Saving...' : 'Change Password'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default ProfilePage;
