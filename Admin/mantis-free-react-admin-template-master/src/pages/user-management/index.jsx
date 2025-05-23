import { useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import api from 'utils/api';

// assets
import EditIcon from '@ant-design/icons/EditOutlined';
import DeleteIcon from '@ant-design/icons/DeleteOutlined';
import AddIcon from '@ant-design/icons/PlusOutlined';
import SearchIcon from '@ant-design/icons/SearchOutlined';
import CloseIcon from '@ant-design/icons/CloseOutlined';
import LockIcon from '@ant-design/icons/LockOutlined';
import UnlockIcon from '@ant-design/icons/UnlockOutlined';

// ==============================|| USER MANAGEMENT ||============================== //

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Client'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    // S'assurer que users est un tableau
    if (!Array.isArray(users)) {
      console.error('Users is not an array:', users);
      setFilteredUsers([]);
      setPage(0);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      try {
        const filtered = users.filter(
          (user) =>
            (user && user.name && user.name.toLowerCase().includes(lowercasedQuery)) ||
            (user && user.email && user.email.toLowerCase().includes(lowercasedQuery)) ||
            (user && user.role && user.role.toLowerCase().includes(lowercasedQuery))
        );
        setFilteredUsers(filtered);
      } catch (error) {
        console.error('Error filtering users:', error);
        setFilteredUsers([]);
      }
    }
    // Reset to first page when search changes
    setPage(0);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');

      // Vérifier la structure de la réponse et extraire le tableau d'utilisateurs
      console.log('API Response:', response.data);

      if (response.data && response.data.success && Array.isArray(response.data.users)) {
        // Format correct: { success: true, users: [...] }
        setUsers(response.data.users);
      } else if (response.data && Array.isArray(response.data)) {
        // Format alternatif: directement un tableau
        setUsers(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // Si la réponse est un objet mais pas dans le format attendu
        // Essayer de trouver une propriété qui contient un tableau
        const possibleUserArrays = Object.values(response.data).filter((val) => Array.isArray(val));
        if (possibleUserArrays.length > 0) {
          // Utiliser le premier tableau trouvé
          setUsers(possibleUserArrays[0]);
        } else {
          // Fallback: créer un tableau vide
          console.error('Unexpected API response format:', response.data);
          setUsers([]);
          setSnackbar({
            open: true,
            message: 'Error: Unexpected API response format',
            severity: 'error'
          });
        }
      } else {
        // Fallback: créer un tableau vide
        console.error('Unexpected API response format:', response.data);
        setUsers([]);
        setSnackbar({
          open: true,
          message: 'Error: Unexpected API response format',
          severity: 'error'
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Initialiser avec un tableau vide en cas d'erreur
      setSnackbar({
        open: true,
        message: 'Error fetching users',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'Client'
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenEditDialog = (user) => {
    setCurrentUser({
      ...user,
      password: '' // Don't show the password in the edit form
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleOpenDeleteDialog = (user) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleAddUser = async () => {
    try {
      // Utiliser la nouvelle route pour créer des utilisateurs par les administrateurs
      const response = await api.post('/auth/users', newUser);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'User added successfully',
          severity: 'success'
        });
        fetchUsers();
        handleCloseAddDialog();
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error adding user',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error adding user',
        severity: 'error'
      });
    }
  };

  const handleEditUser = async () => {
    try {
      // Create a copy of the user object without the _id field
      const { _id, ...userData } = currentUser;

      // Only include password if it's not empty
      if (!userData.password) {
        delete userData.password;
      }

      const response = await api.put(`/auth/users/${currentUser._id}`, userData);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
        fetchUsers();
        handleCloseEditDialog();
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error updating user',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error updating user',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await api.delete(`/auth/users/${currentUser._id}`);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        fetchUsers();
        handleCloseDeleteDialog();
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error deleting user',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error deleting user',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Fonction pour bloquer/débloquer un utilisateur
  const handleToggleBlockUser = async (user) => {
    try {
      const newBlockedStatus = !user.isBlocked;
      const response = await api.put(`/auth/users/${user._id}/block`, { isBlocked: newBlockedStatus });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: newBlockedStatus ? `User ${user.name} has been blocked` : `User ${user.name} has been unblocked`,
          severity: 'success'
        });
        fetchUsers();
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error toggling user block status',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error toggling user block status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error toggling user block status',
        severity: 'error'
      });
    }
  };

  return (
    <MainCard title="User Management">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, role..."
          sx={{ width: '40%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="user management table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user._id} sx={{ bgcolor: user.isBlocked ? 'rgba(255, 0, 0, 0.05)' : 'inherit' }}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color={user.isBlocked ? 'error' : 'success'} sx={{ fontWeight: 'bold' }}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenEditDialog(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(user)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color={user.isBlocked ? 'success' : 'warning'}
                      onClick={() => handleToggleBlockUser(user)}
                      disabled={user.role === 'Admin'}
                      title={user.isBlocked ? 'Unblock User' : 'Block User'}
                    >
                      {user.isBlocked ? <UnlockIcon /> : <LockIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={newUser.role} label="Role" onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  {/* Afficher l'option Admin uniquement pour les super admins */}
                  {localStorage.getItem('userRole') === 'Admin' && <MenuItem value="Admin">Admin</MenuItem>}
                  <MenuItem value="Client">Client</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password (leave blank to keep current)"
                  type="password"
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select value={currentUser.role} label="Role" onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}>
                    {/* Afficher l'option Admin uniquement pour les super admins */}
                    {localStorage.getItem('userRole') === 'Admin' && <MenuItem value="Admin">Admin</MenuItem>}
                    <MenuItem value="Client">Client</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{currentUser?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default UserManagement;
