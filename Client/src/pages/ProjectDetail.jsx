import { Box, Tabs, Tab } from '@mui/material';
import Chat from '../components/Chat/Chat';
import ProjectChat from '../components/ProjectChat/ProjectChat';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const [chatTab, setChatTab] = useState(0);

  console.log('user in Chat:', user);

  const handleTabChange = (event, newValue) => {
    setChatTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 64px)' }}>
      <Box sx={{ flex: 1 }}>
        {/* ... existing project content ... */}
      </Box>

      <Box sx={{ width: 350, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={chatTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Chat du projet" />
          <Tab label="Chat IA" />
        </Tabs>

        <Box sx={{ flex: 1, display: chatTab === 0 ? 'block' : 'none', height: 'calc(100% - 48px)' }}>
          <ProjectChat projectId={projectId} />
        </Box>

        <Box sx={{ flex: 1, display: chatTab === 1 ? 'block' : 'none', height: 'calc(100% - 48px)' }}>
          <Chat projectId={projectId} />
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetail;