import React from 'react'
import { Link } from 'react-router-dom'

const WorkDetailsNavbar = () => {

    return(
        <div className='navbar-wrapper'>
            <Link 
                className='navbar-link'
                to="/standard"
                onClick={() => window.history.back()}
            > 
                Back
            </Link>
            <Link className='navbar-link' to='/game'> Game Mode </Link>
        </div>
    )
}

export default WorkDetailsNavbar