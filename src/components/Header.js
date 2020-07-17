import React from 'react'
import portfolioLogo from '../assets/portfolio-logo.png'

const Header = () => {

    return(
        <div className='header-wrapper'>
            <img className='header-logo' src={portfolioLogo} />
        </div>
    )
}

export default Header