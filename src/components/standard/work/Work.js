import React from 'react'
import { Element } from 'react-scroll'
import WorkFilter from './WorkFilter.js'
import WorkList from './WorkList'

const Work = () => {

    return(
        <>
            <Element name='work'>
                <div className='work-layout'>
                    <WorkFilter />
                    <WorkList />
                </div>
            </Element>
        </>
    )
}

export default Work