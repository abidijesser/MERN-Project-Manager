import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// project imports
import { logout } from 'utils/authUtils';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import ProfileOutlined from '@ant-design/icons/ProfileOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab({ handleClose }) {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleLogout = async () => {
    try {
      // Close the profile dropdown
      if (handleClose) {
        handleClose();
      }

      // Call the logout function
      const result = await logout();

      if (result.success) {
        // Show success message
        setSnackbarMessage(result.message || 'Déconnexion réussie');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        // Show error message
        setSnackbarMessage(result.error || 'Erreur lors de la déconnexion');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setSnackbarMessage('Erreur lors de la déconnexion');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton
          onClick={() => {
            handleClose();
            navigate('/profile');
          }}
        >
          <ListItemIcon>
            <UserOutlined />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <ProfileOutlined />
          </ListItemIcon>
          <ListItemText primary="Social Profile" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <WalletOutlined />
          </ListItemIcon>
          <ListItemText primary="Billing" />
        </ListItemButton>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

ProfileTab.propTypes = { handleClose: PropTypes.func };
