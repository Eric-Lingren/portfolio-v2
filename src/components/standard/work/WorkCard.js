import React, { useState } from 'react'
import ReactCardFlip from 'react-card-flip'
import WorkCardFront from './WorkCardFront'
import WorkCardBack from './WorkCardBack'

const WorkCard = ({ id, title, description, images, languages, liveLink, gitLink,  }) => {

    const [ isFlipped, setIsFlipped ] = useState(false)

    const mouseOverCard = () => {
        setIsFlipped(true)
    }

    const mouseOutCard = () => {
        setIsFlipped(false)
    }

    
    return(
        <div>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal" flipSpeedFrontToBack={1} flipSpeedBackToFront={1}>
                <WorkCardFront 
                    mouseOverCard={mouseOverCard} 
                    thumbnail={images[0]}
                />
                <WorkCardBack 
                    mouseOutCard={mouseOutCard} 
                    title={title}
                    description={description}
                    id={id}
                />
            </ReactCardFlip>
            
        </div>
    )
}

export default WorkCard