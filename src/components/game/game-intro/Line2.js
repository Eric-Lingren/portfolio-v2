import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line2Timeline } from '../game-animations/TimelineAnimations'

const Line2 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line2Timeline()
        setTimeout(() => {
            setCurrentIntroLine(3)
        }, 4500) 
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor'> You have been selected to find a </p>
    )
}

export default withGame(Line2)