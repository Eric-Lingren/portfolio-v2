import React from 'react'
import workData from './workData.json'
import WorkCard from './WorkCard'
import '../../stylesheets/layout/work-layout.scss'

const Work = () => {

    const mappedWork = workData.projects.map((project, index) => {
        return(
            <WorkCard 
                key={index}
                title={project.title}
                description={project.description}
                languages={project.languages}
                liveLink={project.liveLink}
                gitLink={project.gitLink}
            />
        )
    })

    return(
        <div className='work-layout'>
            {mappedWork}
        </div>
    )
}

export default Work