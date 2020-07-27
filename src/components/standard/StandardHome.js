import React, { useRef } from 'react'
import Navbar from './Navbar'
import About from './about/About'
import Work from './work/Work'
import Skills from './skills/Skills'

const StandardHome = () => {

    // const aboutRef = useRef(null)
    // const workRef = useRef(null)
    // const skillsRef = useRef(null)

    const scroll = (link) => {
        console.log(link)
    }

    return(
        <div className='standard-site-wrapper'>
        <div className='standard-site-container'>
            <Navbar 
                // scroll={scroll}
            />
            <About />
            <Work />
            <Skills />
            </div>
        </div>
    )
}

export default StandardHome