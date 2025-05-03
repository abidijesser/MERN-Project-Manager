import { Box } from '@mui/material';
import Chat from '../components/Chat/Chat';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  console.log('user in Chat:', user);

  useEffect(() => {
    socketRef.current.on('messages', (msgs) => {
      // Implementation of handling messages
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 64px)' }}>
      <Box sx={{ flex: 1 }}>
        {/* ... existing project content ... */}
      </Box>
      
      <Box sx={{ width: 350, height: '100%' }}>
        <Chat projectId={projectId} />
      </Box>
    </Box>
  );
};

export default ProjectDetail; 