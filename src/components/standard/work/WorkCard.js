import React, { useState } from 'react'
import ReactCardFlip from 'react-card-flip'
import WorkCardFront from './WorkCardFront'
import WorkCardBack from './WorkCardBack'

const WorkCard = ({ id, title, thumbnailDescription, images, languages, liveLink, gitLink,  }) => {

    const [ isFlipped, setIsFlipped ] = useState(false)

    const mouseOverCard = () => {
        setIsFlipped(true)
    }

    const mouseOutCard = () => {
        setIsFlipped(false)
    }

    
    return(
        <div>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal" flipSpeedFrontToBack={.75} flipSpeedBackToFront={.75}>
                <WorkCardFront 
                    mouseOverCard={mouseOverCard} 
                    thumbnail={images[0]}
                />
                <WorkCardBack 
                    mouseOutCard={mouseOutCard} 
                    title={title}
                    thumbnailDescription={thumbnailDescription}
                    id={id}
                />
            </ReactCardFlip>
            
        </div>
    )
}

export default WorkCard