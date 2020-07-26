import React from 'react'
import workData from './workData.json'
import WorkCard from './WorkCard'

const WorkList = () => {

    const mappedWork = workData.projects.map((project, index) => {
        
        return(
            <WorkCard 
                key={index}
                id={index}
                title={project.title}
                thumbnailDescription={project.thumbnailDescription}
                images={project.images}
            />
        )
    })

    return(
        <div className='work-list-container'>
            {mappedWork}
        </div>
    )
}

export default WorkList