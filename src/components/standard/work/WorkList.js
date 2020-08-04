import React from 'react'
import workData from './workData.json'
import WorkCard from './WorkCard'

const WorkList = ({selectedFilters}) => {

    const mappedWork = workData.projects.map((project, index) => {
        let card = project.tags.filter(tag => selectedFilters.includes(tag))
        if(card.length){
            return(
                <WorkCard 
                    key={index}
                    id={index}
                    title={project.title}
                    thumbnailDescription={project.thumbnailDescription}
                    thumbnailImage={project.thumbnailImage}
                />
            )
        }
    })

    return(
        <div className='work-list-container'>
            {mappedWork}
        </div>
    )
}

export default WorkList