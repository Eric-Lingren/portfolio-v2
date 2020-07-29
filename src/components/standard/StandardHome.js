import React, { useRef } from 'react'
import Navbar from './Navbar'
import About from './about/About'
import Work from './work/Work'
import Skills from './skills/Skills'

const StandardHome = () => {

    const scroll = (link) => {
        console.log(link)
    }

    return(
        <div className='standard-site-wrapper'>
            <div className='standard-site-container'>
                <Navbar />
                <About />
                <Work />
                <Skills />
            </div>
        </div>
    )
}

export default StandardHome