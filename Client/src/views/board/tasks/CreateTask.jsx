import React from 'react'
import { CContainer, CCard, CCardBody, CCardHeader, CButton, CForm, CFormInput, CFormTextarea, CFormSelect } from '@coreui/react'
import { useNavigate } from 'react-router-dom'  // Import useNavigate
import { useForm } from 'react-hook-form' // Import useForm from react-hook-form

const CreateTask = () => {
  const navigate = useNavigate()  // Initialize navigate
  const { register, handleSubmit, formState: { errors } } = useForm()  // Hook form initialization

  // Function to handle form submission
  const onSubmit = (data) => {
    console.log(data)  // Handle form data (you can replace this with your submit logic)
    navigate('/board/tasks')  // Redirect to the 'BoardTasks' page after submission
  }

  return (
    <CContainer fluid className="mt-4">
      <CCard>
        <CCardHeader>
          <h4>Create New Task</h4>
        </CCardHeader>
        <CCardBody>
          <p>This is the page where you can create a new task.</p>
          
          {/* Form that submits data */}
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CFormInput 
              type="text" 
              placeholder="Title" 
              {...register('title', { required: true })} 
              className="mb-3" 
            />
            {errors.title && <span className="text-danger">Title is required</span>}
            
            <CFormTextarea 
              placeholder="Description" 
              {...register('description', { required: true })} 
              className="mb-3" 
            />
            {errors.description && <span className="text-danger">Description is required</span>}
            
            <CFormSelect {...register('status')} className="mb-3">
              {/* Replace with your TaskStatusEnum */}
              <option value="ToDo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </CFormSelect>
            
            <CFormSelect {...register('priority')} className="mb-3">
              <option value="null">Select Priority</option>
              {/* Replace with your TaskPriorityEnum */}
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </CFormSelect>
            
            <CFormInput type="date" {...register('startDate')} className="mb-3" />
            <CFormInput type="date" {...register('endDate')} className="mb-3" />
            
            <CButton type="submit" color="primary">Create Task</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CreateTask
