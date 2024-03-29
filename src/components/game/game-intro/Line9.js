import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line9Timeline } from '../game-animations/TimelineAnimations'

const Line9 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line9Timeline()
        setTimeout(() => {
            setCurrentIntroLine(10)
        }, 3500)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> Use the <strong>ARROW</strong> keys to move. </p>
    )
}

export default withGame(Line9)