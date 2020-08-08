import React from 'react'
import workData from './workData'
import WorkCard from './WorkCard'

const WorkList = ({selectedFilters}) => {

    let filteredProjects = []

    workData.forEach( project => {
        let matchedProject =  project.tags.filter(tag => selectedFilters.includes(tag))
        matchedProject.length && filteredProjects.push(project)
    })

    const mappedWork = filteredProjects.map((project, index) => {
        return(
            <WorkCard 
                key={index}
                id={index}
                title={project.title}
                thumbnailDescription={project.thumbnailDescription}
                thumbnailImage={project.thumbnailImage}
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