import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {

    return(
        <div className='navbar-wrapper'>
            <Link className='navbar-link' to='/about'> About </Link>
            <Link className='navbar-link' to='/work'> Work </Link>
            <Link className='navbar-link' to='/skills'> Skills </Link>
            <Link className='navbar-link' to='/game'> Game Mode </Link>
        </div>
    )
}

export default Navbar