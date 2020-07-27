import React from 'react'
// import { Link } from 'react-router-dom'
import { Link, animateScroll as scroll } from "react-scroll";

const Navbar = (props) => {

    console.log(props)
    return(
        <div className='navbar-wrapper'>
            {/* <Link className='navbar-link' to='/about'> About </Link> */}
            {/* <Link className='navbar-link' to='/work'> Work </Link> */}
            <Link 
                className='navbar-link' 
                activeClass="active"
                to="about"
                spy={true}
                smooth={true}
                offset={-250}
                duration={700}
            > 
                About 
            </Link>
            <Link 
                className='navbar-link' 
                activeClass="active"
                to="work"
                spy={true}
                smooth={true}
                offset={-70}
                duration={700}
            > 
                Work 
            </Link>
            <Link 
                className='navbar-link' 
                // to='/skills'
                activeClass="active"
                to="skills"
                spy={true}
                smooth={true}
                offset={0}
                duration={700}
            > 
                Skills 
            </Link>
            <Link className='navbar-link' to='/game'> Game Mode </Link>
        </div>
    )
}

export default Navbar