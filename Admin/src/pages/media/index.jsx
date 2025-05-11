import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import api from 'utils/api';

// icons
import SearchIcon from '@ant-design/icons/SearchOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import FileImageOutlined from '@ant-design/icons/FileImageOutlined';
import FileOutlined from '@ant-design/icons/FileOutlined';
import FilePdfOutlined from '@ant-design/icons/FilePdfOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import FileZipOutlined from '@ant-design/icons/FileZipOutlined';
import VideoCameraOutlined from '@ant-design/icons/VideoCameraOutlined';
import AudioOutlined from '@ant-design/icons/AudioOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';

// File type icons mapping
const fileTypeIcons = {
  image: <FileImageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
  document: <FileTextOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
  pdf: <FilePdfOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
  video: <VideoCameraOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
  audio: <AudioOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
  zip: <FileZipOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
  other: <FileOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
};

// Get appropriate icon based on file type and mime type
const getFileIcon = (fileType, mimeType) => {
  if (fileType === 'image') return fileTypeIcons.image;
  if (fileType === 'video') return fileTypeIcons.video;
  if (fileType === 'audio') return fileTypeIcons.audio;
  if (fileType === 'document') {
    if (mimeType === 'application/pdf') return fileTypeIcons.pdf;
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return fileTypeIcons.zip;
    return fileTypeIcons.document;
  }
  return fileTypeIcons.other;
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const MediaManagement = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: false,
    file: null,
    project: '',
    task: ''
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch media on component mount and when filters change
  useEffect(() => {
    fetchMedia();
  }, [page, limit, searchTerm, fileTypeFilter]);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch tasks when project changes
  useEffect(() => {
    if (formData.project) {
      fetchTasks(formData.project);
    } else {
      setTasks([]);
    }
  }, [formData.project]);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      if (response.data.success && response.data.projects) {
        setProjects(response.data.projects);
      } else if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  // Fetch tasks for a specific project
  const fetchTasks = async (projectId) => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    try {
      const response = await api.get('/tasks', {
        params: { project: projectId }
      });

      if (response.data.success && response.data.tasks) {
        setTasks(response.data.tasks);
      } else if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks for project:', error);
      setTasks([]);
    }
  };

  // Fetch media from API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get('/media', {
        params: {
          page,
          limit,
          search: searchTerm,
          fileType: fileTypeFilter
        }
      });

      if (response.data.success) {
        setMedia(response.data.data);
        setTotalPages(response.data.pagination.pages);
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error fetching media',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error fetching media',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Handle file type filter change
  const handleFileTypeFilterChange = (event) => {
    setFileTypeFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle form input change
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    // If project field is changing, reset task selection
    if (name === 'project') {
      setFormData({
        ...formData,
        [name]: value,
        task: '' // Reset task when project changes
      });

      // Log project selection
      console.log('Project selected:', value);

      // Clear tasks if no project is selected
      if (!value) {
        setTasks([]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file
      });
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!formData.title || !formData.file) {
      setSnackbar({
        open: true,
        message: 'Title and file are required',
        severity: 'error'
      });
      return;
    }

    try {
      setUploadLoading(true);

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description || '');
      uploadData.append('tags', formData.tags || '');
      uploadData.append('isPublic', formData.isPublic);
      uploadData.append('file', formData.file);

      // Add project and task data if available
      if (formData.project) {
        uploadData.append('project', formData.project);
      }

      if (formData.task) {
        uploadData.append('task', formData.task);
      }

      const response = await api.post('/media/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Media uploaded successfully',
          severity: 'success'
        });
        setOpenUploadDialog(false);
        resetForm();
        fetchMedia(); // Refresh media list
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error uploading media',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error uploading media',
        severity: 'error'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle media update
  const handleUpdate = async () => {
    if (!formData.title) {
      setSnackbar({
        open: true,
        message: 'Title is required',
        severity: 'error'
      });
      return;
    }

    try {
      setUploadLoading(true);

      const updateData = {
        title: formData.title,
        description: formData.description || '',
        tags: formData.tags || '',
        isPublic: formData.isPublic,
        project: formData.project || null,
        task: formData.task || null
      };

      const response = await api.put(`/media/${selectedMedia._id}`, updateData);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Media updated successfully',
          severity: 'success'
        });
        setOpenEditDialog(false);
        fetchMedia(); // Refresh media list
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error updating media',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating media:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error updating media',
        severity: 'error'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle media deletion
  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await api.delete(`/media/${selectedMedia._id}`);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Media deleted successfully',
          severity: 'success'
        });
        setOpenDeleteDialog(false);
        fetchMedia(); // Refresh media list
      } else {
        setSnackbar({
          open: true,
          message: response.data.error || 'Error deleting media',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error deleting media',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: '',
      isPublic: false,
      file: null,
      project: '',
      task: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear tasks when form is reset
    setTasks([]);
  };

  // Open upload dialog
  const openUpload = () => {
    resetForm();
    setOpenUploadDialog(true);
  };

  // Open view dialog
  const openView = (media) => {
    setSelectedMedia(media);
    setOpenViewDialog(true);
  };

  // Vérifier si un projet existe dans la liste des projets
  const projectExists = (projectId) => {
    return projects.some((project) => project._id === projectId);
  };

  // Vérifier si une tâche existe dans la liste des tâches
  const taskExists = (taskId) => {
    return tasks.some((task) => task._id === taskId);
  };

  // Récupérer un projet par son ID
  const fetchProjectById = async (projectId) => {
    if (!projectId) return null;

    try {
      console.log('Fetching project by ID:', projectId);
      const response = await api.get(`/projects/${projectId}`);

      if (response.data.success && response.data.project) {
        // Ajouter le projet à la liste des projets s'il n'y est pas déjà
        if (!projectExists(projectId)) {
          setProjects((prevProjects) => [...prevProjects, response.data.project]);
        }
        return response.data.project;
      } else if (response.data && !response.data.success) {
        console.error('Error fetching project:', response.data.error);
        return null;
      } else if (response.data) {
        // Si la réponse est directement le projet
        if (!projectExists(response.data._id)) {
          setProjects((prevProjects) => [...prevProjects, response.data]);
        }
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
  };

  // Récupérer une tâche par son ID
  const fetchTaskById = async (taskId, projectId) => {
    if (!taskId) return null;

    try {
      console.log('Fetching task by ID:', taskId);
      const response = await api.get(`/tasks/${taskId}`);

      if (response.data.success && response.data.task) {
        // Ajouter la tâche à la liste des tâches si elle n'y est pas déjà
        if (!taskExists(taskId)) {
          setTasks((prevTasks) => [...prevTasks, response.data.task]);
        }
        return response.data.task;
      } else if (response.data && !response.data.success) {
        console.error('Error fetching task:', response.data.error);
        return null;
      } else if (response.data) {
        // Si la réponse est directement la tâche
        if (!taskExists(response.data._id)) {
          setTasks((prevTasks) => [...prevTasks, response.data]);
        }
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      return null;
    }
  };

  // Open edit dialog
  const openEdit = async (media) => {
    setSelectedMedia(media);
    console.log('Opening edit dialog for media:', media);

    // Extract project and task IDs
    const projectId = media.project?._id || media.project || '';
    const taskId = media.task?._id || media.task || '';

    console.log('Project ID:', projectId);
    console.log('Task ID:', taskId);

    // Vérifier si le projet existe dans la liste des projets
    let projectValid = projectId ? projectExists(projectId) : true;

    // Si le projet n'existe pas dans la liste mais qu'un ID est fourni, essayer de le récupérer
    if (projectId && !projectValid) {
      console.log('Project not in list, fetching...');
      const project = await fetchProjectById(projectId);
      projectValid = !!project;
    }

    // Récupérer les tâches pour le projet si un projet valide est assigné
    if (projectId && projectValid) {
      await fetchTasks(projectId);
    }

    // Vérifier si la tâche existe dans la liste des tâches
    let taskValid = taskId ? taskExists(taskId) : true;

    // Si la tâche n'existe pas dans la liste mais qu'un ID est fourni, essayer de la récupérer
    if (taskId && !taskValid && projectId) {
      console.log('Task not in list, fetching...');
      const task = await fetchTaskById(taskId, projectId);
      taskValid = !!task;
    }

    setFormData({
      title: media.title,
      description: media.description || '',
      tags: media.tags ? media.tags.join(', ') : '',
      isPublic: media.isPublic || false,
      file: null,
      project: projectValid ? projectId : '',
      task: taskValid ? taskId : ''
    });

    setOpenEditDialog(true);
  };

  // Open delete dialog
  const openDelete = (media) => {
    setSelectedMedia(media);
    setOpenDeleteDialog(true);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Render file preview in view dialog
  const renderFilePreview = () => {
    if (!selectedMedia) return null;

    const fileUrl = `http://localhost:3001/${selectedMedia.filePath}`;

    if (selectedMedia.fileType === 'image') {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img src={fileUrl} alt={selectedMedia.title} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
        </Box>
      );
    } else if (selectedMedia.fileType === 'video') {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}>
            <source src={fileUrl} type={selectedMedia.mimeType} />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    } else if (selectedMedia.fileType === 'audio') {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <audio controls style={{ width: '100%' }}>
            <source src={fileUrl} type={selectedMedia.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </Box>
      );
    } else if (selectedMedia.mimeType === 'application/pdf') {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <iframe src={fileUrl} title={selectedMedia.title} width="100%" height="400px" style={{ border: 'none' }} />
        </Box>
      );
    } else {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Stack direction="column" spacing={2} alignItems="center">
            {getFileIcon(selectedMedia.fileType, selectedMedia.mimeType)}
            <Typography variant="body1">{selectedMedia.fileName}</Typography>
            <Button variant="contained" color="primary" href={fileUrl} target="_blank" rel="noopener noreferrer">
              Download File
            </Button>
          </Stack>
        </Box>
      );
    }
  };

  return (
    <MainCard title="Media Management">
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="search-media">Search</InputLabel>
              <OutlinedInput
                id="search-media"
                value={searchTerm}
                onChange={handleSearchChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                label="Search"
                placeholder="Search by title, description, or tags"
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="file-type-filter-label">File Type</InputLabel>
              <Select
                labelId="file-type-filter-label"
                id="file-type-filter"
                value={fileTypeFilter}
                onChange={handleFileTypeFilterChange}
                label="File Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="image">Images</MenuItem>
                <MenuItem value="document">Documents</MenuItem>
                <MenuItem value="video">Videos</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button variant="contained" color="primary" startIcon={<UploadOutlined />} onClick={openUpload}>
              Upload New Media
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : media.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No media files found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                media.map((item) => (
                  <TableRow key={item._id} hover>
                    <TableCell>{getFileIcon(item.fileType, item.mimeType)}</TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.title}
                      </Typography>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                        </Typography>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Chip key={index} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                          {item.tags.length > 3 && (
                            <Chip label={`+${item.tags.length - 3}`} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                    <TableCell>{item.uploadedBy?.name || 'Unknown'}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton color="primary" size="small" onClick={() => openView(item)} title="View">
                          <EyeOutlined />
                        </IconButton>
                        <IconButton color="success" size="small" onClick={() => openEdit(item)} title="Edit">
                          <EditOutlined />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => openDelete(item)} title="Delete">
                          <DeleteOutlined />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" showFirstButton showLastButton />
        </Box>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => !uploadLoading && setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload New Media</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField name="title" label="Title" value={formData.title} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="tags"
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={handleInputChange}
                fullWidth
                placeholder="tag1, tag2, tag3"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <input ref={fileInputRef} type="file" id="media-file" style={{ display: 'none' }} onChange={handleFileChange} />
                  <Button variant="outlined" component="label" htmlFor="media-file" startIcon={<UploadOutlined />} disabled={uploadLoading}>
                    Select File
                  </Button>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {formData.file ? formData.file.name : 'No file selected'}
                  </Typography>
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select name="project" value={formData.project} label="Project" onChange={handleInputChange}>
                  <MenuItem value="">None</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </Select>
                {formData.project && !projectExists(formData.project) && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    The selected project is not available in the list. Please select another project.
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Task</InputLabel>
                <Select
                  name="task"
                  value={formData.task}
                  label="Task"
                  onChange={handleInputChange}
                  disabled={!formData.project || tasks.length === 0}
                >
                  <MenuItem value="">None</MenuItem>
                  {tasks.map((task) => (
                    <MenuItem key={task._id} value={task._id}>
                      {task.title}
                    </MenuItem>
                  ))}
                </Select>
                {formData.task && !taskExists(formData.task) && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    The selected task is not available in the list. Please select another task.
                  </Typography>
                )}
                {formData.project && tasks.length === 0 && (
                  <Typography variant="caption" color="info" sx={{ mt: 1, display: 'block' }}>
                    No tasks available for the selected project.
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl>
                <label>
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Make this file public (accessible without authentication)
                </label>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)} disabled={uploadLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={uploadLoading || !formData.file}
            startIcon={uploadLoading ? <CircularProgress size={20} /> : <UploadOutlined />}
          >
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        {selectedMedia && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{selectedMedia.title}</Typography>
                <IconButton onClick={() => setOpenViewDialog(false)}>
                  <CloseOutlined />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {renderFilePreview()}

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                {selectedMedia.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Description:
                    </Typography>
                    <Typography variant="body1">{selectedMedia.description}</Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    File Details:
                  </Typography>
                  <Typography variant="body2">Type: {selectedMedia.fileType}</Typography>
                  <Typography variant="body2">Size: {formatFileSize(selectedMedia.fileSize)}</Typography>
                  <Typography variant="body2">Original Name: {selectedMedia.fileName}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Upload Information:
                  </Typography>
                  <Typography variant="body2">Uploaded By: {selectedMedia.uploadedBy?.name || 'Unknown'}</Typography>
                  <Typography variant="body2">Upload Date: {formatDate(selectedMedia.createdAt)}</Typography>
                  <Typography variant="body2">Visibility: {selectedMedia.isPublic ? 'Public' : 'Private'}</Typography>
                </Grid>

                {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Tags:
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {selectedMedia.tags.map((tag, index) => (
                        <Chip key={index} label={tag} sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color="primary"
                href={`http://localhost:3001/${selectedMedia.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOpenViewDialog(false);
                  openEdit(selectedMedia);
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => !uploadLoading && setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Media</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField name="title" label="Title" value={formData.title} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="tags"
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={handleInputChange}
                fullWidth
                placeholder="tag1, tag2, tag3"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select name="project" value={formData.project} label="Project" onChange={handleInputChange}>
                  <MenuItem value="">None</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </Select>
                {formData.project && !projectExists(formData.project) && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    The selected project is not available in the list. Please select another project.
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Task</InputLabel>
                <Select
                  name="task"
                  value={formData.task}
                  label="Task"
                  onChange={handleInputChange}
                  disabled={!formData.project || tasks.length === 0}
                >
                  <MenuItem value="">None</MenuItem>
                  {tasks.map((task) => (
                    <MenuItem key={task._id} value={task._id}>
                      {task.title}
                    </MenuItem>
                  ))}
                </Select>
                {formData.task && !taskExists(formData.task) && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    The selected task is not available in the list. Please select another task.
                  </Typography>
                )}
                {formData.project && tasks.length === 0 && (
                  <Typography variant="caption" color="info" sx={{ mt: 1, display: 'block' }}>
                    No tasks available for the selected project.
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl>
                <label>
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  Make this file public (accessible without authentication)
                </label>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} disabled={uploadLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            color="primary"
            disabled={uploadLoading}
            startIcon={uploadLoading ? <CircularProgress size={20} /> : <SaveOutlined />}
          >
            {uploadLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => !loading && setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Media</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete "{selectedMedia?.title}"? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteOutlined />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default MediaManagement;
