import React from 'react'
import workData from './workData'
import WorkCard from './WorkCard'

import "./workMenuItems/menutest.scss";

import MenuItem from "./workMenuItems/MenuItem";
{
  /* <nav class="menu" >

        <MenuItem />
            
        <MenuItem />
      </nav> */
}



const WorkList = ({selectedFilters}) => {

    const renderMappedWorkList = true

    let filteredProjects = []

    workData.forEach( project => {
        let matchedProject =  project.tags.filter(tag => selectedFilters.includes(tag))
        matchedProject.length && filteredProjects.push(project)
    })

    const mappedWorkCards = filteredProjects.map((project, index) => {
        return(
            <WorkCard 
                key={index}
                id={project.id}
                title={project.title}
                thumbnailDescription={project.thumbnailDescription}
                thumbnailImage={project.thumbnailImage}
            />
        )
    })

    const mappedWorkList = filteredProjects.map((project, index) => {
        return (
          // <h1>{project.title}</h1>
          <MenuItem
            key={index}
            id={project.id}
            title={project.title}
            thumbnailDescription={project.thumbnailDescription}
            thumbnailImage={project.thumbnailImage}
          />
        );
    })

    return(
        // <div className='work-list-container'>
        <div className={renderMappedWorkList ? 'menu' : 'work-list-container'}>
            {renderMappedWorkList ? mappedWorkList : mappedWorkCards}
            {/* {mappedWorkCards} */}
        </div>
    )
}

export default WorkList