import React from 'react'
import { Link } from 'react-router-dom'

const WorkCardBack = ({ mouseOutCard, id, title, description  }) => {

    return(
        <div className='work-card-tile-container work-card-tile-back' onMouseLeave={mouseOutCard}>
            <h2 className='work-card-title'> { title } </h2>
            <p className='work-card-description'> { description } </p>
            <Link className='work-card-more-details' to=''> More Details </Link>
        </div>
    )
}

export default WorkCardBack