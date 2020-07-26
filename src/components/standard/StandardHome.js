import React from 'react'
import Navbar from './Navbar'
import About from './about/About'
import Work from './work/Work'

const StandardHome = () => {

    return(
        <div className='standard-site-wrapper'>
        <div className='standard-site-container'>
            <Navbar />
            <About />
            <Work />
            </div>
        </div>
    )
}

export default StandardHome