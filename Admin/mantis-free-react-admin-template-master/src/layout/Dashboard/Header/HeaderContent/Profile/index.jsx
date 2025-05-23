import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project imports
import { logout, getCurrentUser } from 'utils/authUtils';
import api from 'utils/api';

// material-ui
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// project imports
import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import avatar1 from 'assets/images/users/avatar-1.png';

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`
  };
}

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    // If no event is provided, just close the dropdown
    if (!event) {
      setOpen(false);
      return;
    }

    // Otherwise, check if the click was inside the dropdown
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLogout = async () => {
    try {
      // Close the profile dropdown
      handleClose();

      // Call the logout function
      const result = await logout();

      if (result.success) {
        // Show success message
        setSnackbarMessage(result.message || 'Déconnexion réussie');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Redirect to client login page after a short delay
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/#/login';
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
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <ButtonBase
          sx={(theme) => ({
            p: 0.25,
            bgcolor: open ? 'grey.100' : 'transparent',
            borderRadius: 1,
            '&:hover': { bgcolor: 'secondary.lighter' },
            '&:focus-visible': { outline: `2px solid ${theme.palette.secondary.dark}`, outlineOffset: 2 },
            ...theme.applyStyles('dark', {
              bgcolor: open ? 'background.default' : 'transparent',
              '&:hover': { bgcolor: 'secondary.light' }
            })
          })}
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', p: 0.5 }}>
            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
              {user ? user.name : 'Loading...'}
            </Typography>
            {profilePicture ? (
              <Avatar alt="profile user" src={`http://localhost:3001/${profilePicture}`} size="sm" />
            ) : (
              <Avatar alt="profile user" src={avatar1} size="sm" />
            )}
          </Stack>
        </ButtonBase>
        <Popper
          placement="bottom-end"
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          popperOptions={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 9]
                }
              }
            ]
          }}
        >
          {({ TransitionProps }) => (
            <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
              <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: 290, minWidth: 240, maxWidth: { xs: 250, md: 290 } })}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard elevation={0} border={false} content={false}>
                    <CardContent sx={{ px: 2.5, pt: 3 }}>
                      <Grid container justifyContent="space-between" alignItems="center">
                        <Grid>
                          <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
                            {profilePicture ? (
                              <Avatar alt="profile user" src={`http://localhost:3001/${profilePicture}`} sx={{ width: 32, height: 32 }} />
                            ) : (
                              <Avatar alt="profile user" src={avatar1} sx={{ width: 32, height: 32 }} />
                            )}
                            <Stack>
                              <Typography variant="h6">{user ? user.name : 'Loading...'}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user ? user.email : ''}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid>
                          <Tooltip title="Logout">
                            <IconButton size="large" sx={{ color: 'text.primary' }} onClick={handleLogout}>
                              <LogoutOutlined />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </CardContent>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label="profile tabs">
                        <Tab
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textTransform: 'capitalize',
                            gap: 1.25,
                            '& .MuiTab-icon': {
                              marginBottom: 0
                            }
                          }}
                          icon={<UserOutlined />}
                          label="Profile"
                          {...a11yProps(0)}
                        />
                        <Tab
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textTransform: 'capitalize',
                            gap: 1.25,
                            '& .MuiTab-icon': {
                              marginBottom: 0
                            }
                          }}
                          icon={<SettingOutlined />}
                          label="Setting"
                          {...a11yProps(1)}
                        />
                      </Tabs>
                    </Box>
                    <TabPanel value={value} index={0} dir={theme.direction}>
                      <ProfileTab handleClose={handleClose} />
                    </TabPanel>
                    <TabPanel value={value} index={1} dir={theme.direction}>
                      <SettingTab />
                    </TabPanel>
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number, other: PropTypes.any };
