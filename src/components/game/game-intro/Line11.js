import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line9Timeline } from '../game-animations/TimelineAnimations'

const Line11 = ({ setToggleIsInGameMode }) => {

    useEffect(() => {
        line9Timeline()
        window.addEventListener('keydown', setToggleIsInGameMode)
    })

    useEffect(() => {
        return () => window.removeEventListener('keydown', setToggleIsInGameMode)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> Press any key to begin... </p>
    )
}

export default withGame(Line11)