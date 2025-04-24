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
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
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
  Chip,
  Tooltip
} from '@mui/material';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CloseOutlined,
  CalendarOutlined,
  SyncOutlined,
  SearchOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import api from 'utils/api';
import adminApi from 'utils/adminApi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const TaskManagement = ({ dashboardView = false }) => {
  // State for tasks list
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    _id: '', // Initialize with empty string to avoid undefined
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: new Date(),
    project: '',
    assignedTo: '',
    googleCalendarEventId: null // Initialize Google Calendar Event ID
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

  // State for calendar sync
  const [syncing, setSyncing] = useState(false);

  // Fetch tasks, projects, and users on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter tasks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = tasks.filter(
        (task) =>
          (task.title && task.title.toLowerCase().includes(lowercasedQuery)) ||
          (task.description && task.description.toLowerCase().includes(lowercasedQuery)) ||
          (task.project && task.project.projectName && task.project.projectName.toLowerCase().includes(lowercasedQuery)) ||
          (task.assignedTo && task.assignedTo.name && task.assignedTo.name.toLowerCase().includes(lowercasedQuery)) ||
          (task.status && task.status.toLowerCase().includes(lowercasedQuery)) ||
          (task.priority && task.priority.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredTasks(filtered);
    }
    // Reset to first page when search changes
    setPage(0);
  }, [searchQuery, tasks]);

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
        console.log('Fetched tasks data:', JSON.stringify(tasksRes.data.tasks));
        setTasks(tasksRes.data.tasks);
      }

      if (projectsRes.data.success) {
        console.log('Fetched projects data:', JSON.stringify(projectsRes.data.projects));
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

  // Fetch a specific project by ID (used when a task has a project that's not in our list)
  const fetchProjectById = async (projectId) => {
    if (!projectId) return null;

    try {
      console.log('Fetching specific project by ID:', projectId);
      const response = await api.get(`/projects/${projectId}`);

      if (response.data.success && response.data.project) {
        console.log('Fetched project data:', response.data.project);

        // Add this project to our projects list if it's not already there
        setProjects((prevProjects) => {
          // Check if project already exists in the list
          const exists = prevProjects.some((p) => p._id === projectId);
          if (!exists) {
            console.log('Adding missing project to projects list');
            return [...prevProjects, response.data.project];
          }
          return prevProjects;
        });

        return response.data.project;
      }
      return null;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
  };

  // Handle project selection change to filter available members
  const handleProjectChange = async (projectId) => {
    console.log('Project change called with ID:', projectId);

    // Validate project ID
    if (!projectId) {
      console.log('No project ID provided, clearing members');
      setCurrentTask({ ...currentTask, project: '', assignedTo: '' });
      setAvailableMembers([]);
      return;
    }

    // Check if the project exists in our projects list
    const projectExists = projects.some((p) => p._id === projectId);
    if (!projectExists) {
      console.warn('Selected project ID does not exist in available projects:', projectId);
    }

    // Update the current task with the new project ID
    setCurrentTask({ ...currentTask, project: projectId, assignedTo: '' });

    try {
      // Fetch project members directly from the server
      console.log('Fetching members for project ID:', projectId);
      const response = await api.get(`/projects/${projectId}/members`);

      if (response.data.success && response.data.members) {
        // Set the available members from the response
        console.log('Available members for project:', response.data.members);
        setAvailableMembers(response.data.members);
      } else {
        console.log('No members found for project or invalid response');
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

    // Special handling for project field to ensure members are updated
    if (name === 'project') {
      handleProjectChange(value);
    } else {
      setCurrentTask({ ...currentTask, [name]: value });
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setCurrentTask({ ...currentTask, dueDate: date });
  };

  // Open task dialog for adding a new task
  const handleAddTask = () => {
    // Reset the current task with all fields properly initialized
    setCurrentTask({
      _id: '', // Explicitly set to empty string
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: new Date(),
      project: '',
      assignedTo: '',
      googleCalendarEventId: null // Reset Google Calendar Event ID
    });

    // Set form mode to add
    setTaskFormMode('add');

    // Clear available members
    setAvailableMembers([]);

    // Open the dialog
    setOpenTaskDialog(true);

    console.log('Add task dialog opened with reset task data');
  };

  // Open task dialog for editing an existing task
  const handleEditTask = async (taskId) => {
    try {
      // Validate task ID
      if (!taskId) {
        console.error('Error: Task ID is undefined or null');
        setSnackbar({
          open: true,
          message: 'Error: Cannot edit task with undefined ID',
          severity: 'error'
        });
        return;
      }

      // Ensure taskId is a string
      const taskIdStr = String(taskId);
      console.log('Editing task with ID (string):', taskIdStr);
      console.log('Task ID type:', typeof taskId);

      // Set task form mode to edit first to ensure it's properly set
      setTaskFormMode('edit');

      // Initialize the current task with the ID to ensure it's set
      setCurrentTask((prev) => {
        console.log('Setting task ID in currentTask:', taskIdStr);
        return {
          ...prev,
          _id: taskIdStr
        };
      });

      // Direct fetch using fetch API as a backup method
      try {
        const token = localStorage.getItem('token');
        const fetchResponse = await fetch(`http://localhost:3001/api/tasks/${taskIdStr}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Fetch API response status:', fetchResponse.status);

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          console.log('Fetch API task data:', JSON.stringify(data));

          if (data.success && data.task) {
            const task = data.task;
            console.log('Task from API:', JSON.stringify(task));
            console.log('Task ID from API:', task._id);
            console.log('Task ID type from API:', typeof task._id);
            console.log('Google Calendar Event ID:', task.googleCalendarEventId);

            // Find the task in our local state as a fallback
            const localTask = tasks.find((t) => t._id === taskId);
            console.log('Local task data:', localTask);

            // Use data from API or fallback to local data
            const taskToEdit = task || localTask;

            if (!taskToEdit) {
              throw new Error('Task not found in API response or local state');
            }

            // Ensure the _id is properly set and converted to string
            const taskId = taskToEdit._id ? taskToEdit._id.toString() : null;
            if (!taskId) {
              throw new Error('Task ID is missing or invalid');
            }

            // Create a clean task object with all required fields
            const updatedTask = {
              _id: taskId,
              title: taskToEdit.title || '',
              description: taskToEdit.description || '',
              status: taskToEdit.status || 'To Do',
              priority: taskToEdit.priority || 'Medium',
              dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : new Date(),
              project: '',
              assignedTo: '',
              // Preserve Google Calendar Event ID if it exists
              googleCalendarEventId: taskToEdit.googleCalendarEventId || null
            };

            // Handle project ID - ensure we get the ID string
            if (taskToEdit.project) {
              if (typeof taskToEdit.project === 'object' && taskToEdit.project._id) {
                updatedTask.project = taskToEdit.project._id.toString();
              } else if (typeof taskToEdit.project === 'string') {
                updatedTask.project = taskToEdit.project;
              }
            }

            // Handle assignedTo ID - ensure we get the ID string
            if (taskToEdit.assignedTo) {
              if (typeof taskToEdit.assignedTo === 'object' && taskToEdit.assignedTo._id) {
                updatedTask.assignedTo = taskToEdit.assignedTo._id.toString();
              } else if (typeof taskToEdit.assignedTo === 'string') {
                updatedTask.assignedTo = taskToEdit.assignedTo;
              }
            }

            console.log('Setting current task:', updatedTask);
            setCurrentTask(updatedTask);

            // Set available members based on the selected project
            if (updatedTask.project) {
              await handleProjectChange(updatedTask.project);
            }

            setOpenTaskDialog(true);
            return;
          }
        }
      } catch (fetchError) {
        console.error('Fetch API error:', fetchError);
      }

      // If fetch API fails, try axios as originally implemented
      try {
        const response = await api.get(`/tasks/${taskIdStr}`);
        if (response.data.success) {
          const task = response.data.task;
          console.log('Axios task data from server:', JSON.stringify(task));
          console.log('Task ID from Axios:', task._id);
          console.log('Task ID type from Axios:', typeof task._id);
          console.log('Google Calendar Event ID from Axios:', task.googleCalendarEventId);

          if (!task || !task._id) {
            throw new Error('Task data is incomplete');
          }

          // Ensure the _id is properly set and converted to string
          const taskIdFromAxios = task._id ? task._id.toString() : null;
          if (!taskIdFromAxios) {
            throw new Error('Task ID is missing or invalid in axios response');
          }

          // Create a clean task object with all required fields
          const updatedTask = {
            _id: taskIdFromAxios,
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'To Do',
            priority: task.priority || 'Medium',
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
            project: '',
            assignedTo: '',
            // Preserve Google Calendar Event ID if it exists
            googleCalendarEventId: task.googleCalendarEventId || null
          };

          // Handle project ID - ensure we get the ID string
          if (task.project) {
            if (typeof task.project === 'object' && task.project._id) {
              updatedTask.project = task.project._id.toString();
            } else if (typeof task.project === 'string') {
              updatedTask.project = task.project;
            }
          }

          // Handle assignedTo ID - ensure we get the ID string
          if (task.assignedTo) {
            if (typeof task.assignedTo === 'object' && task.assignedTo._id) {
              updatedTask.assignedTo = task.assignedTo._id.toString();
            } else if (typeof task.assignedTo === 'string') {
              updatedTask.assignedTo = task.assignedTo;
            }
          }

          console.log('Setting current task from axios:', updatedTask);
          setCurrentTask(updatedTask);

          // Set available members based on the selected project
          if (updatedTask.project) {
            await handleProjectChange(updatedTask.project);
          }

          setOpenTaskDialog(true);
          return;
        }
      } catch (axiosError) {
        console.error('Axios error:', axiosError);

        // Last resort: try to find the task in our local state
        const localTask = tasks.find((t) => t._id && t._id.toString() === taskIdStr);
        if (localTask) {
          console.log('Using local task data as last resort:', JSON.stringify(localTask));
          console.log('Task ID from local state:', localTask._id);
          console.log('Task ID type from local state:', typeof localTask._id);
          console.log('Google Calendar Event ID from local state:', localTask.googleCalendarEventId);

          // Ensure the _id is properly set and converted to string
          const taskIdFromLocal = localTask._id ? localTask._id.toString() : null;
          if (!taskIdFromLocal) {
            throw new Error('Task ID is missing or invalid in local state');
          }

          // Create a clean task object with all required fields
          const updatedTask = {
            _id: taskIdFromLocal,
            title: localTask.title || '',
            description: localTask.description || '',
            status: localTask.status || 'To Do',
            priority: localTask.priority || 'Medium',
            dueDate: localTask.dueDate ? new Date(localTask.dueDate) : new Date(),
            project: '',
            assignedTo: '',
            // Preserve Google Calendar Event ID if it exists
            googleCalendarEventId: localTask.googleCalendarEventId || null
          };

          // Handle project ID - ensure we get the ID string
          if (localTask.project) {
            if (typeof localTask.project === 'object' && localTask.project._id) {
              updatedTask.project = localTask.project._id.toString();
            } else if (typeof localTask.project === 'string') {
              updatedTask.project = localTask.project;
            }
          }

          // Handle assignedTo ID - ensure we get the ID string
          if (localTask.assignedTo) {
            if (typeof localTask.assignedTo === 'object' && localTask.assignedTo._id) {
              updatedTask.assignedTo = localTask.assignedTo._id.toString();
            } else if (typeof localTask.assignedTo === 'string') {
              updatedTask.assignedTo = localTask.assignedTo;
            }
          }

          console.log('Setting current task from local state:', updatedTask);
          setCurrentTask(updatedTask);

          // Set available members based on the selected project
          if (updatedTask.project) {
            await handleProjectChange(updatedTask.project);
          }

          setOpenTaskDialog(true);
          return;
        }

        // If all methods fail, show error
        throw new Error('Could not retrieve task data through any method');
      }
    } catch (error) {
      console.error('Error in handleEditTask:', error);

      // Show detailed error message
      let errorMessage = 'Error fetching task details';
      if (error.response?.data?.error) {
        errorMessage += ': ' + error.response.data.error;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  // Handle task form submission
  const handleTaskSubmit = async () => {
    try {
      // Log the current task data
      console.log('Submitting task with data:', currentTask);
      console.log('Task ID type:', typeof currentTask._id);
      console.log('Task ID value:', currentTask._id);

      // All fields are now optional, no validation needed
      console.log('All fields are optional, proceeding with submission');

      // Format data for API
      const taskData = {
        ...currentTask,
        dueDate: currentTask.dueDate.toISOString()
      };

      // Ensure we preserve the Google Calendar Event ID if it exists
      if (currentTask.googleCalendarEventId) {
        taskData.googleCalendarEventId = currentTask.googleCalendarEventId;
        console.log('Preserving Google Calendar Event ID:', currentTask.googleCalendarEventId);
      }

      console.log('Task form mode:', taskFormMode);
      console.log('Current task:', currentTask);

      let response;
      if (taskFormMode === 'add') {
        // For new tasks, remove the _id field if it exists
        const { _id, ...newTaskData } = taskData;
        console.log('Submitting new task data:', newTaskData);
        response = await api.post('/tasks', newTaskData);
      } else if (taskFormMode === 'edit') {
        // Get the task ID from currentTask and ensure it's a string
        let taskId = currentTask._id ? currentTask._id.toString() : null;
        console.log('Initial taskId from currentTask:', taskId);

        // Also check the hidden input field as a backup
        if (!taskId) {
          const hiddenInput = document.getElementById('taskId');
          if (hiddenInput && hiddenInput.value) {
            taskId = hiddenInput.value;
            console.log('Retrieved task ID from hidden input:', taskId);
          }
        }

        // Check if we have a task ID in the DOM
        const taskIdAlert = document.getElementById('taskIdAlert');
        if (taskIdAlert && taskIdAlert.value) {
          console.log('Task ID from alert element:', taskIdAlert.value);
          if (!taskId) {
            taskId = taskIdAlert.value;
            console.log('Using task ID from alert element as fallback');
          }
        }

        // Add the task ID to the task data as a fallback
        if (taskId) {
          taskData._id = taskId;
          console.log('Added task ID to task data:', taskId);
        }

        // Validate task ID
        if (!taskId) {
          console.error('Task ID is missing for update operation');
          setSnackbar({
            open: true,
            message: 'Error: Task ID is missing for update operation',
            severity: 'error'
          });
          return;
        }

        console.log('Updating task with ID:', taskId);
        console.log('Update task data:', taskData);

        // Create a simplified update data object without the _id field
        // The server will use the ID from the URL parameter
        const { _id, ...updateDataWithoutId } = taskData;

        // Ensure the task ID is included in the log for debugging
        console.log('Task ID for update:', taskId);
        console.log('Update data without ID field:', updateDataWithoutId);

        // Log Google Calendar Event ID if it exists
        if (updateDataWithoutId.googleCalendarEventId) {
          console.log('Google Calendar Event ID in update data:', updateDataWithoutId.googleCalendarEventId);
        }

        // Use axios for the update with proper error handling
        try {
          // Double check that we have a valid task ID
          if (!taskId) {
            console.error('Task ID is still missing before axios call');
            throw new Error('Task ID is missing');
          }

          // Log the URL and data being sent for debugging
          console.log('Axios update URL:', `/tasks/${taskId}`);
          console.log('Axios update data:', updateDataWithoutId);

          // All fields are optional now, no validation needed
          console.log('All fields are optional for task update, proceeding with submission');

          // Send the update request
          response = await api.put(`/tasks/${taskId}`, updateDataWithoutId);

          // Log the response for debugging
          console.log('Update response:', response);
        } catch (axiosError) {
          console.error('Axios update error:', axiosError);
          throw axiosError; // Re-throw to be caught by the outer try/catch
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Error: Invalid task form mode',
          severity: 'error'
        });
        return;
      }

      if (response && response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: `Task ${taskFormMode === 'add' ? 'created' : 'updated'} successfully`,
          severity: 'success'
        });
        setOpenTaskDialog(false);
        fetchData(); // Refresh tasks list
      } else {
        console.error('Invalid response format:', response);
        setSnackbar({
          open: true,
          message: 'Error: Received invalid response from server',
          severity: 'error'
        });
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

  // Handle calendar sync for a task
  const handleSyncTask = async (taskId) => {
    try {
      setSyncing(true);
      const response = await api.post(`/calendar/sync-task/${taskId}`);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Task synced with Google Calendar successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error syncing task with Google Calendar:', error);
      setSnackbar({
        open: true,
        message: 'Error syncing task: ' + (error.response?.data?.error || error.message),
        severity: 'error'
      });
    } finally {
      setSyncing(false);
    }
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
  const renderTaskFormDialog = () => {
    // Log current state for debugging
    console.log('Current task in dialog:', currentTask);
    console.log('Available projects:', projects);
    console.log('Task form mode:', taskFormMode);
    console.log('Task ID in form:', currentTask._id);

    // Check if the current task's project exists in the projects list
    const projectExists = currentTask.project && projects.some((p) => p._id === currentTask.project);

    // If we're editing and the project doesn't exist in our list, try to fetch it
    useEffect(() => {
      const fetchMissingProject = async () => {
        if (taskFormMode === 'edit' && currentTask.project && !projectExists) {
          console.warn('Project ID not found in available projects:', currentTask.project);
          console.log('Attempting to fetch missing project...');

          // Try to fetch the missing project
          const project = await fetchProjectById(currentTask.project);

          if (project) {
            console.log('Successfully fetched missing project:', project);
          } else {
            console.warn('Could not fetch missing project');
          }
        }
      };

      fetchMissingProject();
    }, [currentTask.project, openTaskDialog]);

    // Ensure task ID is properly set when editing and fetch task data if needed
    useEffect(() => {
      if (taskFormMode === 'edit' && openTaskDialog) {
        console.log('Task ID in edit mode:', currentTask._id);
        console.log('Task ID type:', typeof currentTask._id);
        console.log('Current task data:', currentTask);

        // Get the task ID from URL or data attributes if it's not in currentTask
        let taskId = currentTask._id;

        // Try to get task ID from URL if it's not in currentTask
        if (!taskId) {
          const urlParams = new URLSearchParams(window.location.search);
          const urlTaskId = urlParams.get('taskId');
          if (urlTaskId) {
            console.log('Found task ID in URL:', urlTaskId);
            taskId = urlTaskId;
          }
        }

        // Try to get task ID from data attribute if it's still not found
        if (!taskId) {
          const editDialog = document.querySelector('[data-task-id]');
          if (editDialog) {
            const dataTaskId = editDialog.getAttribute('data-task-id');
            if (dataTaskId) {
              console.log('Found task ID in data attribute:', dataTaskId);
              taskId = dataTaskId;
            }
          }
        }

        // If we have a task ID but the task data is incomplete, fetch the task data
        const fetchTaskIfNeeded = async () => {
          if (taskId && (!currentTask.title || !currentTask.description)) {
            console.log('Task data is incomplete, fetching from API...');
            try {
              const response = await api.get(`/tasks/${taskId}`);
              if (response.data.success && response.data.task) {
                const task = response.data.task;
                console.log('Successfully fetched task data:', task);

                // Create a clean task object with all required fields
                const updatedTask = {
                  _id: taskId,
                  title: task.title || '',
                  description: task.description || '',
                  status: task.status || 'To Do',
                  priority: task.priority || 'Medium',
                  dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
                  project: '',
                  assignedTo: '',
                  googleCalendarEventId: task.googleCalendarEventId || null
                };

                // Handle project ID
                if (task.project) {
                  if (typeof task.project === 'object' && task.project._id) {
                    updatedTask.project = task.project._id.toString();
                  } else if (typeof task.project === 'string') {
                    updatedTask.project = task.project;
                  }
                }

                // Handle assignedTo ID
                if (task.assignedTo) {
                  if (typeof task.assignedTo === 'object' && task.assignedTo._id) {
                    updatedTask.assignedTo = task.assignedTo._id.toString();
                  } else if (typeof task.assignedTo === 'string') {
                    updatedTask.assignedTo = task.assignedTo;
                  }
                }

                console.log('Setting updated task data:', updatedTask);
                setCurrentTask(updatedTask);

                // If project is set, load available members
                if (updatedTask.project) {
                  handleProjectChange(updatedTask.project);
                }
              }
            } catch (error) {
              console.error('Error fetching task data:', error);
            }
          }
        };

        fetchTaskIfNeeded();

        // Ensure the task ID is set in the form
        setTimeout(() => {
          const hiddenInput = document.getElementById('taskId');
          if (hiddenInput) {
            if (taskId) {
              hiddenInput.value = taskId.toString();
              console.log('Set task ID in hidden input:', hiddenInput.value);

              // Also update currentTask if needed
              if (!currentTask._id) {
                setCurrentTask((prev) => ({
                  ...prev,
                  _id: taskId.toString()
                }));
              }
            } else {
              console.error('Task ID is missing in currentTask and could not be found elsewhere');
            }
          } else {
            console.error('Hidden input element not found');
          }

          // Also update the alert hidden input
          const alertHiddenInput = document.getElementById('taskIdAlert');
          if (alertHiddenInput) {
            if (taskId) {
              alertHiddenInput.value = taskId.toString();
              console.log('Set task ID in alert hidden input:', alertHiddenInput.value);
            } else {
              console.error('Task ID is missing for alert hidden input');
            }
          } else {
            console.error('Alert hidden input element not found');
          }
        }, 100);
      }
    }, [taskFormMode, openTaskDialog, currentTask._id]);

    // Update hidden input whenever currentTask changes
    useEffect(() => {
      if (openTaskDialog) {
        setTimeout(() => {
          const hiddenInput = document.getElementById('taskId');
          if (hiddenInput) {
            // For add mode, we don't need a task ID
            if (taskFormMode === 'add') {
              hiddenInput.value = '';
              console.log('Task ID cleared for add mode');
              return;
            }

            // For edit mode, ensure we have a task ID
            if (currentTask._id) {
              hiddenInput.value = currentTask._id.toString();
              console.log('Updated task ID in hidden input on currentTask change:', hiddenInput.value);
            } else {
              console.error('Task ID is missing in currentTask during update');

              // Try to recover the task ID from the dialog data attribute
              const dialog = document.querySelector('[data-task-id]');
              if (dialog) {
                const dataTaskId = dialog.getAttribute('data-task-id');
                if (dataTaskId) {
                  console.log('Recovered task ID from dialog attribute:', dataTaskId);
                  hiddenInput.value = dataTaskId;

                  // Update the currentTask state with the recovered ID
                  setCurrentTask((prev) => ({
                    ...prev,
                    _id: dataTaskId
                  }));
                }
              }
            }
          } else {
            console.error('Hidden input element not found during update');
          }
        }, 100);
      }
    }, [currentTask, openTaskDialog, taskFormMode]);

    // If we're editing and the project doesn't exist in our list, we need to handle it
    // This could happen if the project was deleted or if there's a data mismatch
    const projectValue = projectExists ? currentTask.project : '';

    return (
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth data-task-id={currentTask._id || ''}>
        <DialogTitle>
          {taskFormMode === 'add' ? 'Add New Task' : `Edit Task (ID: ${currentTask._id || 'Unknown'})`}
          {taskFormMode === 'edit' && (
            <Typography variant="caption" display="block" color="textSecondary">
              Task ID: {currentTask._id || 'Unknown'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {taskFormMode === 'edit' && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Editing task with ID: {currentTask._id || 'Unknown'}
                  {currentTask.googleCalendarEventId && (
                    <Box mt={1}>
                      <Typography variant="caption" display="block">
                        Google Calendar Event ID: {currentTask.googleCalendarEventId}
                      </Typography>
                    </Box>
                  )}
                </Alert>
                {/* Hidden input to ensure task ID is always included */}
                <input
                  type="hidden"
                  id="taskIdAlert"
                  name="taskIdAlert"
                  value={currentTask._id || ''}
                  data-testid="task-id-alert"
                  key={`task-id-alert-${currentTask._id || 'new'}`} // Force re-render when ID changes
                />
                {/* Hidden input for Google Calendar Event ID */}
                {currentTask.googleCalendarEventId && (
                  <input
                    type="hidden"
                    id="googleCalendarEventId"
                    name="googleCalendarEventId"
                    value={currentTask.googleCalendarEventId}
                    data-testid="google-calendar-event-id"
                  />
                )}
              </Grid>
            )}
            {/* Hidden input for task ID - always included regardless of mode */}
            <input
              type="hidden"
              id="taskId"
              name="_id"
              value={currentTask._id || ''}
              data-testid="task-id-input"
              key={`task-id-${currentTask._id || 'new'}`} // Force re-render when ID changes
            />

            <Grid item xs={12}>
              <TextField fullWidth label="Title" name="title" value={currentTask.title} onChange={handleTaskInputChange} />
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!projectExists && Boolean(currentTask.project)}>
                <InputLabel>Project</InputLabel>
                <Select name="project" value={projectValue} onChange={(e) => handleProjectChange(e.target.value)} label="Project">
                  <MenuItem value="">
                    <em>Select a project</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </Select>
                {!projectExists && currentTask.project && (
                  <>
                    <FormHelperText error>The original project is not available. Please select a new project.</FormHelperText>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
                          const project = await fetchProjectById(currentTask.project);
                          if (project) {
                            setSnackbar({
                              open: true,
                              message: 'Project found and added to the list',
                              severity: 'success'
                            });
                          } else {
                            setSnackbar({
                              open: true,
                              message: 'Project could not be found',
                              severity: 'error'
                            });
                          }
                        }}
                      >
                        Try to Fetch Project
                      </Button>
                    </Box>
                  </>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={currentTask.status} onChange={handleTaskInputChange} label="Status">
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
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
                  slotProps={{ textField: { fullWidth: true } }}
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
  };

  // Render task details dialog
  const renderTaskDetailsDialog = () => (
    <Dialog open={openTaskDetails} onClose={() => setOpenTaskDetails(false)} maxWidth="md" fullWidth>
      {taskDetails && (
        <>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">{taskDetails.title}</Typography>
              <Box display="flex" alignItems="center">
                <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                  ID: {taskDetails._id}
                </Typography>
                <IconButton onClick={() => setOpenTaskDetails(false)}>
                  <CloseOutlined />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2, mt: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="body1" paragraph>
                      {taskDetails.description}
                    </Typography>
                  </Paper>
                </Box>
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
                      {taskDetails.googleCalendarEventId && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="textSecondary">
                            Google Calendar:
                          </Typography>
                          <Chip label="Synced" color="success" size="small" icon={<SyncOutlined />} />
                        </Box>
                      )}
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
                      {taskDetails.assignedTo && taskDetails.assignedTo.email && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="textSecondary">
                            Assignee Email:
                          </Typography>
                          <Typography variant="body2">{taskDetails.assignedTo.email}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Timeline
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                          Created:
                        </Typography>
                        <Typography variant="body2">{new Date(taskDetails.createdAt).toLocaleString()}</Typography>
                      </Box>
                      {taskDetails.updatedAt && taskDetails.updatedAt !== taskDetails.createdAt && (
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                            Last Updated:
                          </Typography>
                          <Typography variant="body2">{new Date(taskDetails.updatedAt).toLocaleString()}</Typography>
                        </Box>
                      )}
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                          Due:
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            new Date(taskDetails.dueDate) < new Date() && taskDetails.status !== 'Done' ? 'error.main' : 'text.primary'
                          }
                        >
                          {new Date(taskDetails.dueDate).toLocaleString()}
                          {new Date(taskDetails.dueDate) < new Date() && taskDetails.status !== 'Done' && (
                            <Chip label="Overdue" color="error" size="small" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={async () => {
                console.log('Edit button clicked, task ID:', taskDetails._id);
                console.log('Full task details:', JSON.stringify(taskDetails));

                // Ensure we have a valid task ID
                const taskId = taskDetails._id ? taskDetails._id.toString() : '';
                console.log('Task ID from details:', taskId);
                console.log('Task ID type:', typeof taskDetails._id);

                if (!taskId) {
                  console.error('Task ID is missing in details data');
                  setSnackbar({
                    open: true,
                    message: 'Error: Task ID is missing in details data',
                    severity: 'error'
                  });
                  return;
                }

                // Always fetch the latest task data from the API to ensure we have complete data
                try {
                  console.log('Fetching latest task data from API for edit from details...');
                  const response = await api.get(`/tasks/${taskId}`);

                  if (response.data.success && response.data.task) {
                    const freshTask = response.data.task;
                    console.log('Successfully fetched fresh task data from details view:', freshTask);

                    // Create a clean task object with all required fields
                    const taskToEdit = {
                      _id: taskId,
                      title: freshTask.title || '',
                      description: freshTask.description || '',
                      status: freshTask.status || 'To Do',
                      priority: freshTask.priority || 'Medium',
                      dueDate: freshTask.dueDate ? new Date(freshTask.dueDate) : new Date(),
                      project: '',
                      assignedTo: '',
                      // Preserve Google Calendar Event ID if it exists
                      googleCalendarEventId: freshTask.googleCalendarEventId || null
                    };

                    // Log Google Calendar Event ID if it exists
                    if (freshTask.googleCalendarEventId) {
                      console.log('Google Calendar Event ID from API (details view):', freshTask.googleCalendarEventId);
                    }

                    // Handle project ID - ensure we get the ID string
                    if (freshTask.project) {
                      if (typeof freshTask.project === 'object' && freshTask.project._id) {
                        taskToEdit.project = freshTask.project._id.toString();
                      } else if (typeof freshTask.project === 'string') {
                        taskToEdit.project = freshTask.project;
                      }
                    }

                    // Handle assignedTo ID - ensure we get the ID string
                    if (freshTask.assignedTo) {
                      if (typeof freshTask.assignedTo === 'object' && freshTask.assignedTo._id) {
                        taskToEdit.assignedTo = freshTask.assignedTo._id.toString();
                      } else if (typeof freshTask.assignedTo === 'string') {
                        taskToEdit.assignedTo = freshTask.assignedTo;
                      }
                    }

                    console.log('Setting task with fresh data from details view:', taskToEdit);

                    // Set task form mode
                    setTaskFormMode('edit');

                    // Set current task
                    setCurrentTask(taskToEdit);

                    // If project is set, try to fetch it if it doesn't exist in our list
                    if (taskToEdit.project) {
                      const projectExists = projects.some((p) => p._id === taskToEdit.project);
                      if (!projectExists) {
                        console.log('Project not in list, attempting to fetch:', taskToEdit.project);
                        fetchProjectById(taskToEdit.project).then((project) => {
                          if (project) {
                            console.log('Successfully fetched project for edit from details:', project);
                          }
                          // Load available members regardless
                          handleProjectChange(taskToEdit.project);
                        });
                      } else {
                        handleProjectChange(taskToEdit.project);
                      }
                    }

                    // Close details dialog and open edit dialog
                    setOpenTaskDetails(false);
                    setOpenTaskDialog(true);
                  } else {
                    // Fallback to using the data from the details view if API fetch fails
                    console.warn('API fetch failed, using details view data as fallback');

                    // Create a clean task object with all required fields
                    const taskToEdit = {
                      _id: taskId,
                      title: taskDetails.title || '',
                      description: taskDetails.description || '',
                      status: taskDetails.status || 'To Do',
                      priority: taskDetails.priority || 'Medium',
                      dueDate: taskDetails.dueDate ? new Date(taskDetails.dueDate) : new Date(),
                      project: '',
                      assignedTo: '',
                      // Preserve Google Calendar Event ID if it exists
                      googleCalendarEventId: taskDetails.googleCalendarEventId || null
                    };

                    // Log Google Calendar Event ID if it exists
                    if (taskDetails.googleCalendarEventId) {
                      console.log('Google Calendar Event ID from details fallback:', taskDetails.googleCalendarEventId);
                    }

                    // Handle project ID - ensure we get the ID string
                    if (taskDetails.project) {
                      if (typeof taskDetails.project === 'object' && taskDetails.project._id) {
                        taskToEdit.project = taskDetails.project._id.toString();
                      } else if (typeof taskDetails.project === 'string') {
                        taskToEdit.project = taskDetails.project;
                      }
                    }

                    // Handle assignedTo ID - ensure we get the ID string
                    if (taskDetails.assignedTo) {
                      if (typeof taskDetails.assignedTo === 'object' && taskDetails.assignedTo._id) {
                        taskToEdit.assignedTo = taskDetails.assignedTo._id.toString();
                      } else if (typeof taskDetails.assignedTo === 'string') {
                        taskToEdit.assignedTo = taskDetails.assignedTo;
                      }
                    }

                    console.log('Setting task with fallback data from details:', taskToEdit);

                    // Set task form mode
                    setTaskFormMode('edit');

                    // Set current task
                    setCurrentTask(taskToEdit);

                    // If project is set, handle project change
                    if (taskToEdit.project) {
                      handleProjectChange(taskToEdit.project);
                    }

                    // Close details dialog and open edit dialog
                    setOpenTaskDetails(false);
                    setOpenTaskDialog(true);
                  }
                } catch (error) {
                  console.error('Error fetching task data from details view:', error);
                  setSnackbar({
                    open: true,
                    message: 'Error fetching task data: ' + (error.response?.data?.error || error.message),
                    severity: 'error'
                  });
                }
              }}
              color="primary"
              startIcon={<EditOutlined />}
            >
              Edit
            </Button>
            <Button onClick={() => handleDeleteTask(taskDetails._id)} color="error" startIcon={<DeleteOutlined />}>
              Delete
            </Button>
            <Button onClick={() => handleSyncTask(taskDetails._id)} color="secondary" disabled={syncing} startIcon={<CalendarOutlined />}>
              Sync to Calendar
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
      ? filteredTasks.slice(0, 5) // Show only 5 tasks in dashboard view
      : filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Log the tasks data for debugging
    console.log('Tasks data for rendering:', JSON.stringify(displayedTasks));

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Tooltip title="Click on any task title to view details" arrow placement="top">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Title{' '}
                    <Box component="span" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                      👁️
                    </Box>
                  </Box>
                </Tooltip>
              </TableCell>
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
                <TableCell
                  sx={{
                    cursor: 'pointer',
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => handleViewTaskDetails(task._id)}
                >
                  <Tooltip title="Click to view task details" arrow placement="top">
                    <span>{task.title}</span>
                  </Tooltip>
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
                  <Tooltip title="View Task Details" arrow>
                    <IconButton color="info" size="small" onClick={() => handleViewTaskDetails(task._id)} sx={{ mr: 0.5 }}>
                      <Box component="span" sx={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                        👁️
                      </Box>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Task" arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={async () => {
                        console.log('Edit icon clicked, task ID:', task._id);
                        console.log('Full task object:', JSON.stringify(task));
                        console.log('Task ID type:', typeof task._id);

                        // Ensure we have a valid task ID
                        const taskId = task._id ? task._id.toString() : '';
                        console.log('Task ID from table row:', taskId);

                        if (!taskId) {
                          console.error('Task ID is missing in table data');
                          setSnackbar({
                            open: true,
                            message: 'Error: Task ID is missing in table data',
                            severity: 'error'
                          });
                          return;
                        }

                        // Always fetch the latest task data from the API to ensure we have complete data
                        try {
                          console.log('Fetching latest task data from API...');
                          const response = await api.get(`/tasks/${taskId}`);

                          if (response.data.success && response.data.task) {
                            const freshTask = response.data.task;
                            console.log('Successfully fetched fresh task data:', freshTask);

                            // Create a clean task object with all required fields
                            const taskToEdit = {
                              _id: taskId,
                              title: freshTask.title || '',
                              description: freshTask.description || '',
                              status: freshTask.status || 'To Do',
                              priority: freshTask.priority || 'Medium',
                              dueDate: freshTask.dueDate ? new Date(freshTask.dueDate) : new Date(),
                              project: '',
                              assignedTo: '',
                              // Preserve Google Calendar Event ID if it exists
                              googleCalendarEventId: freshTask.googleCalendarEventId || null
                            };

                            // Log Google Calendar Event ID if it exists
                            if (freshTask.googleCalendarEventId) {
                              console.log('Google Calendar Event ID from API:', freshTask.googleCalendarEventId);
                            }

                            // Handle project ID - ensure we get the ID string
                            if (freshTask.project) {
                              if (typeof freshTask.project === 'object' && freshTask.project._id) {
                                taskToEdit.project = freshTask.project._id.toString();
                              } else if (typeof freshTask.project === 'string') {
                                taskToEdit.project = freshTask.project;
                              }
                            }

                            // Handle assignedTo ID - ensure we get the ID string
                            if (freshTask.assignedTo) {
                              if (typeof freshTask.assignedTo === 'object' && freshTask.assignedTo._id) {
                                taskToEdit.assignedTo = freshTask.assignedTo._id.toString();
                              } else if (typeof freshTask.assignedTo === 'string') {
                                taskToEdit.assignedTo = freshTask.assignedTo;
                              }
                            }

                            console.log('Setting task with fresh data:', taskToEdit);

                            // Set task form mode
                            setTaskFormMode('edit');

                            // Set current task
                            setCurrentTask(taskToEdit);

                            // If project is set, try to fetch it if it doesn't exist in our list
                            if (taskToEdit.project) {
                              const projectExists = projects.some((p) => p._id === taskToEdit.project);
                              if (!projectExists) {
                                console.log('Project not in list, attempting to fetch:', taskToEdit.project);
                                fetchProjectById(taskToEdit.project).then((project) => {
                                  if (project) {
                                    console.log('Successfully fetched project for edit:', project);
                                  }
                                  // Load available members regardless
                                  handleProjectChange(taskToEdit.project);
                                });
                              } else {
                                handleProjectChange(taskToEdit.project);
                              }
                            }

                            // Open dialog
                            setOpenTaskDialog(true);
                          } else {
                            // Fallback to using the data from the table row if API fetch fails
                            console.warn('API fetch failed, using table row data as fallback');

                            // Create a clean task object with all required fields
                            const taskToEdit = {
                              _id: taskId,
                              title: task.title || '',
                              description: task.description || '',
                              status: task.status || 'To Do',
                              priority: task.priority || 'Medium',
                              dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
                              project: '',
                              assignedTo: '',
                              // Preserve Google Calendar Event ID if it exists
                              googleCalendarEventId: task.googleCalendarEventId || null
                            };

                            // Handle project ID - ensure we get the ID string
                            if (task.project) {
                              if (typeof task.project === 'object' && task.project._id) {
                                taskToEdit.project = task.project._id.toString();
                              } else if (typeof task.project === 'string') {
                                taskToEdit.project = task.project;
                              }
                            }

                            // Handle assignedTo ID - ensure we get the ID string
                            if (task.assignedTo) {
                              if (typeof task.assignedTo === 'object' && task.assignedTo._id) {
                                taskToEdit.assignedTo = task.assignedTo._id.toString();
                              } else if (typeof task.assignedTo === 'string') {
                                taskToEdit.assignedTo = task.assignedTo;
                              }
                            }

                            console.log('Setting task with fallback data:', taskToEdit);

                            // Set task form mode
                            setTaskFormMode('edit');

                            // Set current task
                            setCurrentTask(taskToEdit);

                            // If project is set, handle project change
                            if (taskToEdit.project) {
                              handleProjectChange(taskToEdit.project);
                            }

                            // Open dialog
                            setOpenTaskDialog(true);
                          }
                        } catch (error) {
                          console.error('Error fetching task data:', error);
                          setSnackbar({
                            open: true,
                            message: 'Error fetching task data: ' + (error.response?.data?.error || error.message),
                            severity: 'error'
                          });
                        }
                      }}
                    >
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Task" arrow>
                    <IconButton color="error" size="small" onClick={() => handleDeleteTask(task._id)}>
                      <DeleteOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sync to Google Calendar" arrow>
                    <IconButton color="secondary" size="small" onClick={() => handleSyncTask(task._id)} disabled={syncing}>
                      <CalendarOutlined />
                    </IconButton>
                  </Tooltip>
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
            count={filteredTasks.length}
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              label="Search Tasks"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, project, etc."
              sx={{ width: '40%' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseOutlined />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
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
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseOutlined fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ width: '200px' }}
              />
              <Button variant="contained" color="primary" size="small" startIcon={<PlusOutlined />} onClick={handleAddTask}>
                Add Task
              </Button>
            </Box>
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
