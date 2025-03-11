import React from 'react'
import classNames from 'classnames'

import {
  CCard,
  CCardFooter,
  CCol,
  CProgress,
  CRow,
} from '@coreui/react'


const BoardTasks = () => {
  const progressExample = [
    { title: 'Completed', value: 'in the last 7 days', percent: 40, color: 'success' },
    { title: 'Created', value: 'in the last 7 days', percent: 20, color: 'info' },
    { title: 'Updated', value: 'in the last 7 days', percent: 60, color: 'warning' },
    { title: 'Due Soon', value: 'during the next 7 days', percent: 80, color: 'danger' },
  ]


  return (
    <>
    
      <CCard className="mb-4">
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {progressExample.map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value} ({item.percent}%)
                </div>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
      
      
    </>
  )
}

export default BoardTasks
