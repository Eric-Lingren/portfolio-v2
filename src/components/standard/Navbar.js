import React from 'react'
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";

const Navbar = () => {

    return(
        <div className='navbar-wrapper'>
            <ScrollLink 
                className='navbar-link' 
                activeClass="active"
                to="about"
                spy={true}
                smooth={true}
                offset={-250}
                duration={700}
            > 
                About 
            </ScrollLink>
            <ScrollLink 
                className='navbar-link' 
                activeClass="active"
                to="work"
                spy={true}
                smooth={true}
                offset={-70}
                duration={700}
            > 
                Work 
            </ScrollLink>
            <ScrollLink 
                className='navbar-link' 
                activeClass="active"
                to="skills"
                spy={true}
                smooth={true}
                offset={0}
                duration={700}
            > 
                Skills 
            </ScrollLink>
            { window.innerWidth > 425 && <Link className='navbar-link' to='/game'> Game Mode </Link> }
        </div>
    )
}

export default Navbar