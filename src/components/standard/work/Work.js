import React from 'react'
import WorkFilter from './WorkFilter.js'
import WorkList from './WorkList'

const Work = () => {

    return(
        <div className='work-layout'>
            <WorkFilter />
            <WorkList />
        </div>
    )
}

export default Work