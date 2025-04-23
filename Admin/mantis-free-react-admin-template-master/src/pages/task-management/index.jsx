import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
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
import { DeleteOutlined, EditOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import api from 'utils/api';
import adminApi from 'utils/adminApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const TaskManagement = ({ dashboardView = false }) => {
  // State for tasks list
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for projects and users (members)
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);

  // State for task form
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState('add'); // 'add' or 'edit'
  const [currentTask, setCurrentTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: new Date(),
    project: '',
    assignedTo: ''
  });

  // State for task details
  const [openTaskDetails, setOpenTaskDetails] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch tasks, projects, and users on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch tasks, projects, and users
  const fetchData = async () => {
    try {
      setLoading(true);
      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled([api.get('/tasks'), api.get('/projects'), adminApi.get('/users')]);

      // Process results
      const [tasksRes, projectsRes, usersRes] = results.map((result) =>
        result.status === 'fulfilled' ? result.value : { data: { success: false } }
      );

      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks);
      }

      if (projectsRes.data.success) {
        setProjects(projectsRes.data.projects);
      }

      if (usersRes.data.success) {
        setAllUsers(usersRes.data.users.filter((user) => user.role === 'Client'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching data: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle project selection change to filter available members
  const handleProjectChange = async (projectId) => {
    setCurrentTask({ ...currentTask, project: projectId, assignedTo: '' });

    if (!projectId) {
      setAvailableMembers([]);
      return;
    }

    try {
      // Fetch project members directly from the server
      const response = await api.get(`/projects/${projectId}/members`);

      if (response.data.success && response.data.members) {
        // Set the available members from the response
        setAvailableMembers(response.data.members);
        console.log('Available members:', response.data.members);
      } else {
        setAvailableMembers([]);
      }
    } catch (error) {
      console.error('Error fetching project members:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching project members: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
      setAvailableMembers([]);
    }
  };

  // Handle task form input change
  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask({ ...currentTask, [name]: value });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setCurrentTask({ ...currentTask, dueDate: date });
  };

  // Open task dialog for adding a new task
  const handleAddTask = () => {
    setCurrentTask({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: new Date(),
      project: '',
      assignedTo: ''
    });
    setTaskFormMode('add');
    setOpenTaskDialog(true);
  };

  // Open task dialog for editing an existing task
  const handleEditTask = async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      if (response.data.success) {
        const task = response.data.task;
        setCurrentTask({
          _id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          project: task.project?._id || '',
          assignedTo: task.assignedTo?._id || ''
        });

        // Set available members based on the selected project
        if (task.project?._id) {
          await handleProjectChange(task.project._id);
        }

        setTaskFormMode('edit');
        setOpenTaskDialog(true);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching task details: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  // Handle task form submission
  const handleTaskSubmit = async () => {
    try {
      // Validate form - all fields are required
      if (
        !currentTask.title ||
        !currentTask.description ||
        !currentTask.project ||
        !currentTask.assignedTo ||
        !currentTask.status ||
        !currentTask.priority ||
        !currentTask.dueDate
      ) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields',
          severity: 'error'
        });
        return;
      }

      // Format data for API
      const taskData = {
        ...currentTask,
        dueDate: currentTask.dueDate.toISOString()
      };

      let response;
      if (taskFormMode === 'add') {
        response = await api.post('/tasks', taskData);
      } else {
        response = await api.put(`/tasks/${currentTask._id}`, taskData);
      }

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Task ${taskFormMode === 'add' ? 'created' : 'updated'} successfully`,
          severity: 'success'
        });
        setOpenTaskDialog(false);
        fetchData(); // Refresh tasks list
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting task: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await api.delete(`/tasks/${taskId}`);
        if (response.data.success) {
          setSnackbar({
            open: true,
            message: 'Task deleted successfully',
            severity: 'success'
          });
          fetchData(); // Refresh tasks list
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting task: ' + (error.response?.data?.error || error.message),
          severity: 'error'
        });
      }
    }
  };

  // View task details
  const handleViewTaskDetails = async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      if (response.data.success) {
        setTaskDetails(response.data.task);
        setOpenTaskDetails(true);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching task details: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'Done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render task form dialog
  const renderTaskFormDialog = () => (
    <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>{taskFormMode === 'add' ? 'Add New Task' : 'Edit Task'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Title" name="title" value={currentTask.title} onChange={handleTaskInputChange} required />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentTask.description}
              onChange={handleTaskInputChange}
              multiline
              rows={4}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Project</InputLabel>
              <Select name="project" value={currentTask.project} onChange={(e) => handleProjectChange(e.target.value)} label="Project">
                <MenuItem value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.projectName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Assigned To</InputLabel>
              <Select
                name="assignedTo"
                value={currentTask.assignedTo}
                onChange={handleTaskInputChange}
                label="Assigned To"
                disabled={!currentTask.project || availableMembers.length === 0}
              >
                <MenuItem value="">
                  <em>Not assigned</em>
                </MenuItem>
                {availableMembers.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={currentTask.status} onChange={handleTaskInputChange} label="Status">
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={currentTask.priority} onChange={handleTaskInputChange} label="Priority">
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={currentTask.dueDate}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
        <Button onClick={handleTaskSubmit} variant="contained" color="primary">
          {taskFormMode === 'add' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render task details dialog
  const renderTaskDetailsDialog = () => (
    <Dialog open={openTaskDetails} onClose={() => setOpenTaskDetails(false)} maxWidth="md" fullWidth>
      {taskDetails && (
        <>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">{taskDetails.title}</Typography>
              <IconButton onClick={() => setOpenTaskDetails(false)}>
                <CloseOutlined />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Description</Typography>
                <Typography variant="body1" paragraph>
                  {taskDetails.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Task Details
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Status:
                        </Typography>
                        <Chip label={taskDetails.status} color={getStatusColor(taskDetails.status)} size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Priority:
                        </Typography>
                        <Chip label={taskDetails.priority} color={getPriorityColor(taskDetails.priority)} size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Due Date:
                        </Typography>
                        <Typography variant="body2">
                          {taskDetails.dueDate ? new Date(taskDetails.dueDate).toLocaleDateString() : 'Not set'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Created At:
                        </Typography>
                        <Typography variant="body2">{new Date(taskDetails.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Assignment
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Project:
                        </Typography>
                        <Typography variant="body2">{taskDetails.project ? taskDetails.project.projectName : 'Not assigned'}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Assigned To:
                        </Typography>
                        <Typography variant="body2">{taskDetails.assignedTo ? taskDetails.assignedTo.name : 'Not assigned'}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Created By:
                        </Typography>
                        <Typography variant="body2">{taskDetails.createdBy ? taskDetails.createdBy.name : 'Unknown'}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleEditTask(taskDetails._id)} color="primary">
              Edit
            </Button>
            <Button onClick={() => handleDeleteTask(taskDetails._id)} color="error">
              Delete
            </Button>
            <Button onClick={() => setOpenTaskDetails(false)}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  // Render tasks table
  const renderTasksTable = () => {
    const displayedTasks = dashboardView
      ? tasks.slice(0, 5) // Show only 5 tasks in dashboard view
      : tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedTasks.map((task) => (
              <TableRow key={task._id} hover>
                <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleViewTaskDetails(task._id)}>
                  {task.title}
                </TableCell>
                <TableCell>{task.project ? task.project.projectName : 'Not assigned'}</TableCell>
                <TableCell>{task.assignedTo ? task.assignedTo.name : 'Not assigned'}</TableCell>
                <TableCell>
                  <Chip label={task.status} color={getStatusColor(task.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={task.priority} color={getPriorityColor(task.priority)} size="small" />
                </TableCell>
                <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => handleEditTask(task._id)}>
                    <EditOutlined />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDeleteTask(task._id)}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {displayedTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {!dashboardView && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    );
  };

  return (
    <>
      {!dashboardView ? (
        <MainCard title="Task Management">
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" color="primary" startIcon={<PlusOutlined />} onClick={handleAddTask}>
              Add Task
            </Button>
          </Box>
          {renderTasksTable()}
        </MainCard>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recent Tasks</Typography>
            <Button variant="contained" color="primary" size="small" startIcon={<PlusOutlined />} onClick={handleAddTask}>
              Add Task
            </Button>
          </Box>
          {renderTasksTable()}
        </>
      )}

      {/* Task Form Dialog */}
      {renderTaskFormDialog()}

      {/* Task Details Dialog */}
      {renderTaskDetailsDialog()}

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskManagement;
