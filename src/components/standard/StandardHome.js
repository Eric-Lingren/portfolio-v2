import React from 'react'
import Navbar from './Navbar'
import About from './about/About'
import Work from './work/Work'
import Skills from './skills/Skills'
import Footer from './Footer'

const StandardHome = () => {

    return(
        <div className='standard-site-wrapper'>
            <div className='standard-site-container'>
                <Navbar />
                <About />
                <Work />
                <Skills />
                <Footer />
            </div>
        </div>
    )
}

export default StandardHome