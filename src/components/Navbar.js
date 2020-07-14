import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {

    return(
        <div className='navbar-wrapper'>
            <ul>
                <Link className='link navbar-link' to='/'> Home </Link>
                <Link className='navbar-link' to='/work'> My Work </Link>
                <Link className='navbar-link' to='/about'> About </Link>
                <Link className='navbar-link' to='/resume'> Resume </Link>
                <Link className='navbar-link' to='/github'> Github </Link>
                <Link className='navbar-link' to='/linkedin'> Linkedin </Link>
                <Link className='navbar-link' to='/game'> Game </Link>
            </ul>
            {/* <div>
                <Link className='link footer-link'> Footer Link </Link>
            </div> */}
        </div>
    )
}

export default Navbar