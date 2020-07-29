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
                {"<-"} Back
            </Link>
            {
                window.innerWidth > 425 ?
                <Link className='navbar-link' to='/game'> Game Mode </Link>
                :
                <span></span>
            }
        </div>
    )
}

export default WorkDetailsNavbar