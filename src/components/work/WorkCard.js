import React from 'react'

const WorkCard = ({ title, description, languages, liveLink, gitLink,  }) => {

    
    return(
        <div>
            <h2> { title } </h2>
            <p> { description } </p>
            <p> { languages } </p>
            <p> { liveLink } </p>
            <p> { gitLink } </p>
        </div>
    )
}

export default WorkCard