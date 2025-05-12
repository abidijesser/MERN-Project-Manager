import React from 'react';
import { CModal, CModalHeader, CModalBody, CModalTitle, CButton } from '@coreui/react';
import ProjectChat from './ProjectChat';
import './ChatModal.css';

const ChatModal = ({ projectId, isOpen, onClose }) => {
  return (
    <CModal
      visible={isOpen}
      onClose={onClose}
      size="lg"
      className="chat-modal"
    >
      <CModalHeader closeButton>
        <CModalTitle>Chat du projet</CModalTitle>
      </CModalHeader>
      <CModalBody className="chat-modal-content p-0">
        <ProjectChat projectId={projectId} />
      </CModalBody>
    </CModal>
  );
};

export default ChatModal;
