import { useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  Chip
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import api from 'utils/api';
import axios from 'axios';

// icons
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

// ==============================|| PROJECT MANAGEMENT ||============================== //

const ProjectManagement = ({ dashboardView = false }) => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);

  // New project state
  const [newProject, setNewProject] = useState({
    projectName: '',
    description: '',
    status: 'Active',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    members: [],
    owner: localStorage.getItem('userId') || '' // Set owner to current user
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch projects and users on component mount
  useEffect(() => {
    fetchProjects();
    fetchUsers();

    // Get current user profile to ensure we have the user ID
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth/profile');
        if (response.data && response.data.user && response.data.user._id) {
          localStorage.setItem('userId', response.data.user._id);
          setNewProject((prev) => ({ ...prev, owner: response.data.user._id }));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Try to get projects from the admin endpoint first
      try {
        const adminResponse = await axios.get('http://localhost:3001/admin/projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        if (adminResponse.data.success && adminResponse.data.projects) {
          setProjects(adminResponse.data.projects);
          setLoading(false);
          return;
        }
      } catch (adminError) {
        console.log('Admin projects endpoint failed, trying regular endpoint');
      }

      // Fallback to regular projects endpoint
      const response = await api.get('/projects');
      if (response.data.success) {
        setProjects(response.data.projects);
      } else if (response.data) {
        // If projects are returned directly without success property
        setProjects(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.data?.error || 'Error fetching projects',
          severity: 'error'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error fetching projects',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Use the same endpoint as in the user-management component
      const response = await api.get('/auth/users');
      // Filter only client users
      let clientUsers = [];
      if (response.data.users) {
        // If users are in a nested property
        clientUsers = response.data.users.filter((user) => user.role === 'Client');
      } else if (Array.isArray(response.data)) {
        // If users are returned directly as an array
        clientUsers = response.data.filter((user) => user.role === 'Client');
      }
      setUsers(clientUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching users',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setNewProject({
      projectName: '',
      description: '',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      members: [],
      owner: localStorage.getItem('userId') || '' // Set owner to current user
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenEditDialog = (project) => {
    // Handle different formats of members data
    let memberIds = [];
    if (project.members) {
      memberIds = project.members.map((member) => {
        if (typeof member === 'string') return member;
        return member._id || member;
      });
    }

    setCurrentProject({
      ...project,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      members: memberIds
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleOpenDeleteDialog = (project) => {
    setCurrentProject(project);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenDetailsDialog = async (project) => {
    try {
      console.log('Opening details for project:', project);

      // Use the project data we already have as a fallback
      let projectData = { ...project };

      // Try to get more detailed project information
      try {
        // First try the admin endpoint
        const adminResponse = await axios.get(`http://localhost:3001/admin/projects/${project._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        console.log('Admin project details response:', adminResponse.data);
        if (adminResponse.data.success && adminResponse.data.project) {
          projectData = adminResponse.data.project;
        } else if (adminResponse.data) {
          projectData = adminResponse.data;
        }
      } catch (adminError) {
        console.log('Admin project details endpoint failed, trying regular endpoint');

        // Try the regular project endpoint
        try {
          const response = await api.get(`/projects/${project._id}`);
          console.log('Project details response:', response.data);

          if (response.data.success && response.data.project) {
            projectData = response.data.project;
          } else if (response.data) {
            // If project is returned directly
            projectData = response.data;
          }
        } catch (projectError) {
          console.error('Regular project endpoint also failed:', projectError);
          // Continue with the project data we already have
        }
      }

      // If members are just IDs, try to fetch member details
      if (projectData.members && projectData.members.length > 0 && typeof projectData.members[0] === 'string') {
        try {
          // Get all users
          const usersResponse = await api.get('/auth/users');
          let users = [];

          if (usersResponse.data.users) {
            users = usersResponse.data.users;
          } else if (Array.isArray(usersResponse.data)) {
            users = usersResponse.data;
          }

          if (users.length > 0) {
            // Replace member IDs with actual user objects
            const memberIds = projectData.members;
            projectData.members = memberIds.map((memberId) => {
              const user = users.find((u) => u._id === memberId);
              return user || memberId; // Return the user object or the ID if not found
            });
          }
        } catch (memberError) {
          console.error('Error fetching member details:', memberError);
          // Continue with the IDs only
        }
      }

      setProjectDetails(projectData);
      setOpenDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching project details',
        severity: 'error'
      });
    }
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setProjectDetails(null);
  };

  // CRUD operations
  const handleAddProject = async () => {
    try {
      // Ensure we have at least 5 members
      if (newProject.members.length < 5) {
        setSnackbar({
          open: true,
          message: 'Project must have at least 5 members',
          severity: 'error'
        });
        return;
      }

      // Make sure we have a valid owner ID
      if (!newProject.owner) {
        const userProfile = await api.get('/auth/profile');
        if (userProfile.data && userProfile.data.user && userProfile.data.user._id) {
          newProject.owner = userProfile.data.user._id;
        }
      }

      // Format dates as ISO strings for the API
      const projectData = {
        ...newProject,
        startDate: newProject.startDate.toISOString(),
        endDate: newProject.endDate.toISOString()
      };

      console.log('Creating project with data:', projectData);
      const response = await api.post('/projects', projectData);
      console.log('Create project response:', response.data);
      if (response.data.success || response.data.project || response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Project added successfully',
          severity: 'success'
        });
        fetchProjects();
        handleCloseAddDialog();
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error adding project',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error adding project',
        severity: 'error'
      });
    }
  };

  const handleEditProject = async () => {
    try {
      // Ensure we have at least 5 members
      if (currentProject.members.length < 5) {
        setSnackbar({
          open: true,
          message: 'Project must have at least 5 members',
          severity: 'error'
        });
        return;
      }

      // Format dates as ISO strings for the API
      const projectData = {
        ...currentProject,
        startDate: currentProject.startDate.toISOString(),
        endDate: currentProject.endDate.toISOString()
      };

      console.log('Updating project with data:', projectData);
      const response = await api.put(`/projects/${currentProject._id}`, projectData);
      console.log('Update project response:', response.data);
      if (response.data.success || response.data.project || response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Project updated successfully',
          severity: 'success'
        });
        fetchProjects();
        handleCloseEditDialog();
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error updating project',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error updating project',
        severity: 'error'
      });
    }
  };

  const handleDeleteProject = async () => {
    try {
      console.log('Deleting project with ID:', currentProject._id);
      const response = await api.delete(`/projects/${currentProject._id}`);
      console.log('Delete project response:', response.data);
      if (response.data.success || response.data.message || response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Project deleted successfully',
          severity: 'success'
        });
        fetchProjects();
        handleCloseDeleteDialog();
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error deleting project',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error deleting project',
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Archived':
        return 'default';
      default:
        return 'primary';
    }
  };

  return (
    <MainCard title={dashboardView ? '' : 'Project Management'}>
      {!dashboardView && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Manage Projects</Typography>
          <Button variant="contained" color="primary" startIcon={<PlusOutlined />} onClick={handleOpenAddDialog}>
            Add Project
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: dashboardView ? 400 : 650 }} aria-label="projects table">
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              {!dashboardView && <TableCell>Description</TableCell>}
              <TableCell>Status</TableCell>
              {!dashboardView && <TableCell>Start Date</TableCell>}
              {!dashboardView && <TableCell>End Date</TableCell>}
              <TableCell>Members</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={dashboardView ? 4 : 7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={dashboardView ? 4 : 7} align="center">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.slice(page * rowsPerPage, page * rowsPerPage + (dashboardView ? 5 : rowsPerPage)).map((project) => (
                <TableRow key={project._id}>
                  <TableCell>{project.projectName}</TableCell>
                  {!dashboardView && (
                    <TableCell>
                      {project.description.length > 50 ? `${project.description.substring(0, 50)}...` : project.description}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip label={project.status} color={getStatusColor(project.status)} size="small" />
                  </TableCell>
                  {!dashboardView && <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>}
                  {!dashboardView && <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>}
                  <TableCell>{project.members.length} members</TableCell>
                  <TableCell>
                    <IconButton color="info" size="small" onClick={() => handleOpenDetailsDialog(project)}>
                      <EyeOutlined style={{ fontSize: '1rem' }} />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleOpenEditDialog(project)}>
                      <EditOutlined style={{ fontSize: '1rem' }} />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(project)}>
                      <DeleteOutlined style={{ fontSize: '1rem' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!dashboardView && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={projects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Add Project Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={newProject.projectName}
                onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={newProject.status} label="Status" onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Members</InputLabel>
                <Select
                  multiple
                  value={newProject.members}
                  label="Members"
                  onChange={(e) => setNewProject({ ...newProject, members: e.target.value })}
                  renderValue={(selected) => `${selected.length} members selected`}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={newProject.startDate ? new Date(newProject.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewProject({ ...newProject, startDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={newProject.endDate ? new Date(newProject.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewProject({ ...newProject, endDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddProject} variant="contained" color="primary">
            Add Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          {currentProject && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={currentProject.projectName}
                  onChange={(e) => setCurrentProject({ ...currentProject, projectName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={currentProject.status}
                    label="Status"
                    onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value })}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Members</InputLabel>
                  <Select
                    multiple
                    value={currentProject.members}
                    label="Members"
                    onChange={(e) => setCurrentProject({ ...currentProject, members: e.target.value })}
                    renderValue={(selected) => `${selected.length} members selected`}
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={currentProject.startDate ? new Date(currentProject.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setCurrentProject({ ...currentProject, startDate: new Date(e.target.value) })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={currentProject.endDate ? new Date(currentProject.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setCurrentProject({ ...currentProject, endDate: new Date(e.target.value) })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained" color="primary">
            Update Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project "{currentProject?.projectName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteProject} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          {projectDetails && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">Project Name</Typography>
                <Typography>{projectDetails.projectName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Description</Typography>
                <Typography>{projectDetails.description}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Status</Typography>
                <Chip label={projectDetails.status} color={getStatusColor(projectDetails.status)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Date Range</Typography>
                <Typography>
                  {new Date(projectDetails.startDate).toLocaleDateString()} - {new Date(projectDetails.endDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Members ({projectDetails.members?.length || 0})</Typography>
                <Box sx={{ mt: 1 }}>
                  {projectDetails.members && projectDetails.members.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projectDetails.members.map((member, index) => {
                            // Handle different member data formats
                            if (typeof member === 'string') {
                              return (
                                <TableRow key={index}>
                                  <TableCell colSpan={3}>Member ID: {member}</TableCell>
                                </TableRow>
                              );
                            }
                            return (
                              <TableRow key={member._id || index}>
                                <TableCell>{member.name || 'N/A'}</TableCell>
                                <TableCell>{member.email || 'N/A'}</TableCell>
                                <TableCell>{member.role || 'N/A'}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No members assigned</Typography>
                  )}
                </Box>
              </Grid>
              {projectDetails.tasks && projectDetails.tasks.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6">Tasks ({projectDetails.tasks.length})</Typography>
                  <Box sx={{ mt: 1 }}>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Due Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {projectDetails.tasks.map((task) => (
                            <TableRow key={task._id}>
                              <TableCell>{task.title}</TableCell>
                              <TableCell>{task.status}</TableCell>
                              <TableCell>{task.priority}</TableCell>
                              <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
              )}
              {projectDetails.comments && projectDetails.comments.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6">Comments</Typography>
                  <List>
                    {projectDetails.comments.map((comment, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={comment} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
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

export default ProjectManagement;
