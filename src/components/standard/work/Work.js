import React, { useState } from 'react'
import { Element } from 'react-scroll'
import WorkFilter from './WorkFilter.js'
import WorkList from './WorkList'
const initialFilters = ["Back End", "Front End", "Full Stack", "Database", "Security", "Linux","Challenges", "Teaching"]

const Work = () => {
    
    const [selectedFilters, setSelectedFilters] = useState(initialFilters)

    const filterWork = (e) => {
        const { name, checked } = e.target
        let filters = selectedFilters
        if (checked){
            filters.push(name)
        } else{
            let index = filters.indexOf(name)
            filters.splice(index, 1)
        }
        setSelectedFilters([...filters])
    }


    return(
        <>
            <Element name='work'>
                <div className='work-layout'>
                    <WorkFilter filterWork={filterWork} />
                    <WorkList selectedFilters={selectedFilters} />
                </div>
            </Element>
        </>
    )
}

export default Work