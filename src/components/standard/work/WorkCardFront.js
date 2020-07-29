import React from 'react'

const WorkCardFront = ({ mouseOverCard, mouseOutCard, thumbnail  }) => {


    return(
        <div 
            className='work-card-tile-container' 
            onMouseEnter={mouseOverCard} 
            onTouchStart={mouseOverCard}
            onMouseLeave={mouseOutCard}
            onTouchEnd={mouseOutCard}
        >
            <div className='work-card-tile-front' >
                <img className='card-front-image' src={thumbnail} alt='card-front'/>
            </div>
        </div>
    )
}

export default WorkCardFront