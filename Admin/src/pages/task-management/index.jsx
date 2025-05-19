import React, { useState, useEffect, useRef } from 'react';
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

  // Create a ref to store the current task ID to ensure it persists across renders
  const taskIdRef = useRef('');

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

  // Update the ref whenever currentTask._id changes
  useEffect(() => {
    if (currentTask._id) {
      taskIdRef.current = currentTask._id;
      console.log('Updated taskIdRef with:', currentTask._id);
    }
  }, [currentTask._id]);

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
      // Use adminApi for projects to get all projects without filtering by user
      const results = await Promise.allSettled([api.get('/api/tasks'), adminApi.get('/projects'), adminApi.get('/users')]);

      // Process results
      const [tasksRes, projectsRes, usersRes] = results.map((result) =>
        result.status === 'fulfilled' ? result.value : { data: { success: false } }
      );

      if (tasksRes.data.success) {
        console.log('Fetched tasks data:', JSON.stringify(tasksRes.data.tasks));
        setTasks(tasksRes.data.tasks);
      }

      if (projectsRes.data.success) {
        console.log('Fetched projects data from admin API:', JSON.stringify(projectsRes.data.projects));
        console.log('Number of projects fetched:', projectsRes.data.projects.length);
        setProjects(projectsRes.data.projects);
      } else {
        // Fallback to regular API if admin API fails
        try {
          console.log('Admin API failed, trying regular projects API');
          const regularProjectsRes = await api.get('/projects');
          if (regularProjectsRes.data.success) {
            console.log('Fetched projects data from regular API:', JSON.stringify(regularProjectsRes.data.projects));
            console.log('Number of projects fetched (regular API):', regularProjectsRes.data.projects.length);
            setProjects(regularProjectsRes.data.projects);
          }
        } catch (error) {
          console.error('Error fetching projects from regular API:', error);
        }
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
      setCurrentTask((prevTask) => ({ ...prevTask, project: '', assignedTo: '' }));
      setAvailableMembers([]);
      return;
    }

    // Check if the project exists in our projects list
    const projectExists = projects.some((p) => p._id === projectId);
    if (!projectExists) {
      console.warn('Selected project ID does not exist in available projects:', projectId);

      // Try to fetch the project if it doesn't exist in our list
      try {
        const projectResponse = await api.get(`/projects/${projectId}`);
        if (projectResponse.data.success && projectResponse.data.project) {
          console.log('Successfully fetched missing project:', projectResponse.data.project);

          // Add the project to our list
          setProjects((prevProjects) => {
            if (!prevProjects.some((p) => p._id === projectId)) {
              return [...prevProjects, projectResponse.data.project];
            }
            return prevProjects;
          });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    }

    // Update the current task with the new project ID using a callback to ensure we have the latest state
    setCurrentTask((prevTask) => {
      console.log('Updating current task with project ID:', projectId);
      console.log('Previous task state:', prevTask);
      return { ...prevTask, project: projectId, assignedTo: '' };
    });

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

    console.log('Task input changed:', name, value);

    // Special handling for project field to ensure members are updated
    if (name === 'project') {
      handleProjectChange(value);
    } else {
      // Use a callback to ensure we have the latest state
      setCurrentTask((prevTask) => {
        console.log('Updating task field:', name, 'from', prevTask[name], 'to', value);
        return { ...prevTask, [name]: value };
      });
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    console.log('Date changed to:', date);

    // Use a callback to ensure we have the latest state
    setCurrentTask((prevTask) => {
      console.log('Updating dueDate from', prevTask.dueDate, 'to', date);
      return { ...prevTask, dueDate: date };
    });
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
      // We need to make sure the _id is properly set before anything else
      await setCurrentTask((prev) => {
        console.log('Setting task ID in currentTask:', taskIdStr);
        return {
          ...prev,
          _id: taskIdStr
        };
      });

      // Direct fetch using fetch API as a backup method
      try {
        const token = localStorage.getItem('token');
        const fetchResponse = await fetch(`http://192.168.33.10:3001/api/tasks/${taskIdStr}`, {
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
        const response = await api.get(`/api/tasks/${taskIdStr}`);
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

      // Get the task ID directly from the currentTask state
      let taskId = currentTask._id;
      console.log('Task ID from currentTask state:', taskId);

      // Get the task ID from the hidden input as a backup
      const hiddenInput = document.getElementById('taskId');
      let taskIdFromHidden = '';
      if (hiddenInput && hiddenInput.value) {
        taskIdFromHidden = hiddenInput.value;
        console.log('Task ID from hidden input:', taskIdFromHidden);
      }

      // Get the task ID from the dialog data attribute as another backup
      const dialogElement = document.querySelector('[data-task-id]');
      let taskIdFromDialog = '';
      if (dialogElement) {
        taskIdFromDialog = dialogElement.getAttribute('data-task-id');
        console.log('Task ID from dialog attribute:', taskIdFromDialog);
      }

      // Create a copy of the current task
      const taskToSubmit = { ...currentTask };

      // If we're in edit mode but the task ID is missing, try to get it from various sources
      if (taskFormMode === 'edit') {
        if (!taskToSubmit._id) {
          // Try hidden input first
          if (taskIdFromHidden) {
            console.log('Using task ID from hidden input for submission');
            taskToSubmit._id = taskIdFromHidden;
          }
          // Then try dialog attribute
          else if (taskIdFromDialog) {
            console.log('Using task ID from dialog attribute for submission');
            taskToSubmit._id = taskIdFromDialog;
          }
          // If we still don't have an ID, check the submit button
          else {
            const submitButton = document.querySelector('button[data-task-id]');
            const taskIdFromButton = submitButton?.getAttribute('data-task-id');
            if (taskIdFromButton) {
              console.log('Using task ID from submit button for submission');
              taskToSubmit._id = taskIdFromButton;
            }
          }
        }

        console.log('Final task ID for submission:', taskToSubmit._id);

        // If we still don't have a task ID, show an error
        if (!taskToSubmit._id) {
          console.error('Could not find task ID from any source');
          setSnackbar({
            open: true,
            message: 'Error: Could not find task ID from any source',
            severity: 'error'
          });
          return;
        }
      }

      // All fields are now optional, no validation needed
      console.log('All fields are optional, proceeding with submission');

      // Format data for API
      const taskData = {
        ...taskToSubmit,
        dueDate: taskToSubmit.dueDate.toISOString()
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
        response = await api.post('/api/tasks', newTaskData);
      } else if (taskFormMode === 'edit') {
        // Get the task ID from taskToSubmit (which should now have the ID from one of our sources)
        let taskId = taskToSubmit._id ? taskToSubmit._id.toString() : null;
        console.log('Final taskId for update operation:', taskId);

        // Log the task ID type for debugging
        console.log('Task ID type in handleTaskSubmit:', typeof taskToSubmit._id);

        // Double-check that we have a valid task ID
        if (!taskId) {
          console.error('Task ID is still missing before update operation');
          setSnackbar({
            open: true,
            message: 'Error: Task ID is missing before update operation',
            severity: 'error'
          });
          return;
        }

        // Check if we have a task ID in the alert element
        const taskIdAlert = document.getElementById('taskIdAlert');
        if (taskIdAlert && taskIdAlert.value) {
          console.log('Task ID from alert element:', taskIdAlert.value);
          if (!taskId) {
            taskId = taskIdAlert.value;
            console.log('Using task ID from alert element as fallback');
          }
        }

        // Log all possible sources of task ID for debugging
        console.log('Task ID sources:');
        console.log('- From taskToSubmit._id:', taskToSubmit._id);
        console.log('- From taskId variable:', taskId);
        console.log('- From hidden input:', taskIdFromHidden);
        console.log('- From dialog attribute:', taskIdFromDialog);
        console.log('- From alert element:', taskIdAlert?.value);

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
          console.log('Axios update URL:', `/api/tasks/${taskId}`);
          console.log('Axios update data:', updateDataWithoutId);

          // All fields are optional now, no validation needed
          console.log('All fields are optional for task update, proceeding with submission');

          // Send the update request
          response = await api.put(`/api/tasks/${taskId}`, updateDataWithoutId);

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

        // Close the dialog
        setOpenTaskDialog(false);

        // Clear the task ID from localStorage
        localStorage.removeItem('currentEditTaskId');

        // Reset the current task state
        setCurrentTask({
          _id: '',
          title: '',
          description: '',
          status: 'To Do',
          priority: 'Medium',
          dueDate: new Date(),
          project: '',
          assignedTo: '',
          googleCalendarEventId: null
        });

        // Refresh tasks list
        fetchData();
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
        // Get the task details to check if the user is the project owner
        const taskResponse = await api.get(`/api/tasks/${taskId}`);
        const task = taskResponse.data.task;

        // Get user info
        const userRole = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');

        // Check if user is admin or project owner
        const isAdmin = userRole === 'Admin';
        const isProjectOwner = task.project && task.project.owner && task.project.owner._id === userId;

        console.log('Task Management - Delete task - Is admin:', isAdmin);
        console.log('Task Management - Delete task - Is project owner:', isProjectOwner);

        // Only admins or project owners can delete tasks
        if (!isAdmin && !isProjectOwner) {
          setSnackbar({
            open: true,
            message: 'Only administrators or the project owner can delete this task',
            severity: 'error'
          });
          return;
        }

        // Proceed with deletion
        const response = await api.delete(`/api/tasks/${taskId}`);
        if (response.data.success) {
          setSnackbar({
            open: true,
            message: 'Task deleted successfully',
            severity: 'success'
          });
          fetchData(); // Refresh tasks list

          // Close task details dialog if it's open
          if (openTaskDetails) {
            setOpenTaskDetails(false);
          }
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
      const response = await api.get(`/api/tasks/${taskId}`);
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
    console.log('Current task ID type:', typeof currentTask._id);
    console.log('Current task ID value:', currentTask._id);
    console.log('Task ID from ref:', taskIdRef.current);
    console.log('Task form mode:', taskFormMode);
    console.log('Current task title:', currentTask.title);
    console.log('Current task description:', currentTask.description);
    console.log('Current task status:', currentTask.status);
    console.log('Current task priority:', currentTask.priority);
    console.log('Current task dueDate:', currentTask.dueDate);
    console.log('Current task project:', currentTask.project);
    console.log('Current task assignedTo:', currentTask.assignedTo);

    // Use the ID from the ref if the current task ID is missing
    const effectiveTaskId = currentTask._id || taskIdRef.current;

    // Force the component to re-render when the task ID changes
    useEffect(() => {
      console.log('Task ID changed in dialog, new value:', currentTask._id);
      console.log('Effective task ID:', effectiveTaskId);
    }, [currentTask._id, effectiveTaskId]);

    // Force the component to re-render when any task field changes
    useEffect(() => {
      console.log('Task data changed in dialog');
      console.log('Current task in effect:', currentTask);
    }, [currentTask]);

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

    // Fetch task data when needed
    useEffect(() => {
      // If we're in edit mode and the dialog is open, make sure we have complete task data
      if (taskFormMode === 'edit' && openTaskDialog && currentTask._id) {
        // If project is set, load available members
        if (currentTask.project) {
          handleProjectChange(currentTask.project);
        }
      }
    }, [taskFormMode, openTaskDialog, currentTask._id, currentTask.project]);

    // If we're editing and the project doesn't exist in our list, we need to handle it
    // This could happen if the project was deleted or if there's a data mismatch
    const projectValue = projectExists ? currentTask.project : '';

    // We already have taskIdForDisplay defined above, so we don't need to redefine it here

    return (
      <Dialog
        open={openTaskDialog}
        onClose={() => {
          // Simply close the dialog without resetting state
          setOpenTaskDialog(false);
        }}
        maxWidth="md"
        fullWidth
        data-task-id={effectiveTaskId}
      >
        <DialogTitle>
          {taskFormMode === 'add' ? 'Add New Task' : `Edit Task (ID: ${effectiveTaskId || 'Unknown'})`}
          {taskFormMode === 'edit' && (
            <Typography variant="caption" display="block" color="textSecondary">
              Task ID: {effectiveTaskId || 'Unknown'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {taskFormMode === 'edit' && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Editing task with ID: {effectiveTaskId || 'Unknown'}
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
                  value={effectiveTaskId || ''}
                  data-testid="task-id-alert"
                  key={`task-id-alert-${effectiveTaskId || 'new'}`} // Force re-render when ID changes
                />
                {/* Hidden input for Google Calendar Event ID */}
                {currentTask.googleCalendarEventId && (
                  <input
                    type="hidden"
                    id="googleCalendarEventId"
                    name="googleCalendarEventId"
                    value={currentTask.googleCalendarEventId}
                    data-testid="google-calendar-event-id"
                    key={`google-calendar-event-id-${currentTask.googleCalendarEventId}`} // Force re-render
                  />
                )}
              </Grid>
            )}
            {/* Hidden input for task ID - always included regardless of mode */}
            <input
              type="hidden"
              id="taskId"
              name="_id"
              value={effectiveTaskId || ''}
              data-testid="task-id-input"
              key={`task-id-${effectiveTaskId || 'new'}`} // Force re-render when ID changes
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
          <Button
            onClick={handleTaskSubmit}
            variant="contained"
            color="primary"
            data-task-id={effectiveTaskId || ''} // Add task ID as data attribute for backup retrieval
          >
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  Only administrators or the project owner can delete tasks
                </Alert>
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
              onClick={() => {
                console.log('Edit button clicked, task ID:', taskDetails._id);

                // Ensure we have a valid task ID
                const taskId = taskDetails._id ? taskDetails._id.toString() : '';

                if (!taskId) {
                  console.error('Task ID is missing in details data');
                  setSnackbar({
                    open: true,
                    message: 'Error: Task ID is missing in details data',
                    severity: 'error'
                  });
                  return;
                }

                // Close the details dialog first
                setOpenTaskDetails(false);

                // Set the task form mode to edit
                setTaskFormMode('edit');

                // Create a complete task object from the details data
                const taskToEdit = {
                  _id: taskId,
                  title: taskDetails.title || '',
                  description: taskDetails.description || '',
                  status: taskDetails.status || 'To Do',
                  priority: taskDetails.priority || 'Medium',
                  dueDate: taskDetails.dueDate ? new Date(taskDetails.dueDate) : new Date(),
                  project:
                    taskDetails.project && typeof taskDetails.project === 'object' ? taskDetails.project._id : taskDetails.project || '',
                  assignedTo:
                    taskDetails.assignedTo && typeof taskDetails.assignedTo === 'object'
                      ? taskDetails.assignedTo._id
                      : taskDetails.assignedTo || '',
                  googleCalendarEventId: taskDetails.googleCalendarEventId || null
                };

                // Set the current task with the complete data
                setCurrentTask(taskToEdit);

                // Open the dialog
                setOpenTaskDialog(true);
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

                        // Ensure we have a valid task ID
                        const taskId = task._id ? task._id.toString() : '';
                        console.log('Task ID from table row:', taskId);
                        console.log('Task ID type:', typeof taskId);

                        if (!taskId) {
                          console.error('Task ID is missing in table data');
                          setSnackbar({
                            open: true,
                            message: 'Error: Task ID is missing in table data',
                            severity: 'error'
                          });
                          return;
                        }

                        // Update the task ID ref first to ensure it's available
                        taskIdRef.current = taskId;
                        console.log('Updated taskIdRef directly with:', taskId);

                        try {
                          // First set the task form mode to edit
                          setTaskFormMode('edit');

                          // Fetch the task data directly from the API to ensure we have the most up-to-date information
                          console.log('Fetching task data from API for ID:', taskId);
                          const response = await api.get(`/api/tasks/${taskId}`);

                          if (response.data.success && response.data.task) {
                            const apiTask = response.data.task;
                            console.log('Task data fetched from API:', apiTask);

                            // Create a complete task object from the API data
                            const taskToEdit = {
                              _id: taskId, // Ensure this is a string
                              title: apiTask.title || '',
                              description: apiTask.description || '',
                              status: apiTask.status || 'To Do',
                              priority: apiTask.priority || 'Medium',
                              dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : new Date(),
                              project: apiTask.project && typeof apiTask.project === 'object' ? apiTask.project._id : apiTask.project || '',
                              assignedTo:
                                apiTask.assignedTo && typeof apiTask.assignedTo === 'object'
                                  ? apiTask.assignedTo._id
                                  : apiTask.assignedTo || '',
                              googleCalendarEventId: apiTask.googleCalendarEventId || null
                            };

                            console.log('Task object created with ID:', taskToEdit._id);
                            console.log('Task object details:', taskToEdit);

                            // Set the current task with the complete data
                            await new Promise((resolve) => {
                              setCurrentTask(taskToEdit);
                              setTimeout(resolve, 0); // Use setTimeout to ensure state is updated
                            });

                            console.log('Current task set to:', taskToEdit);
                            console.log('Task ID ref is now:', taskIdRef.current);

                            // If project is set, load available members
                            if (taskToEdit.project) {
                              await handleProjectChange(taskToEdit.project);
                            }

                            // Finally open the dialog
                            setOpenTaskDialog(true);
                          } else {
                            throw new Error('Failed to fetch task data from API');
                          }
                        } catch (error) {
                          console.error('Error fetching task data:', error);

                          // Fallback to using the data from the table row
                          console.log('Falling back to table data for task:', task);

                          // Create a complete task object from the row data
                          const taskToEdit = {
                            _id: taskId, // Ensure this is a string
                            title: task.title || '',
                            description: task.description || '',
                            status: task.status || 'To Do',
                            priority: task.priority || 'Medium',
                            dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
                            project: task.project && typeof task.project === 'object' ? task.project._id : task.project || '',
                            assignedTo:
                              task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo || '',
                            googleCalendarEventId: task.googleCalendarEventId || null
                          };

                          console.log('Fallback task object created with ID:', taskToEdit._id);

                          // Set the current task with the fallback data
                          await new Promise((resolve) => {
                            setCurrentTask(taskToEdit);
                            setTimeout(resolve, 0); // Use setTimeout to ensure state is updated
                          });

                          // If project is set, load available members
                          if (taskToEdit.project) {
                            await handleProjectChange(taskToEdit.project);
                          }

                          // Finally open the dialog
                          setOpenTaskDialog(true);
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
          <Alert severity="info" sx={{ mb: 2 }}>
            Only administrators or the project owner can delete tasks
          </Alert>
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
