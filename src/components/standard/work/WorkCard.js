import React, { useState } from 'react'
import ReactCardFlip from 'react-card-flip'
import WorkCardFront from './WorkCardFront'
import WorkCardBack from './WorkCardBack'

const WorkCard = ({ id, title, thumbnailDescription, thumbnailImage, }) => {

    const [ isFlipped, setIsFlipped ] = useState(false)

    const mouseOverCard = () => {
        setIsFlipped(true)
    }

    const mouseOutCard = () => {
        setIsFlipped(false)
    }

    
    return(
        <div>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal" flipSpeedFrontToBack={1.5} flipSpeedBackToFront={1.5}>
                <WorkCardFront 
                    mouseOverCard={mouseOverCard} 
                    thumbnail={thumbnailImage}
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