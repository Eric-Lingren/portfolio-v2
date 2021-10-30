import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line9Timeline } from '../game-animations/TimelineAnimations'

const Line10 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line9Timeline()
        setTimeout(() => {
            setCurrentIntroLine(11)
        }, 3500)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> Use the <strong>SPACE</strong> bar to shoot. </p>
    )
}

export default withGame(Line10)