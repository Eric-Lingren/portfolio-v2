import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line3Timeline } from '../game-animations/TimelineAnimations'

const Line4 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line3Timeline()
        setTimeout(() => {
            setCurrentIntroLine(5)
        }, 3000)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> SKILLFUL </p>
    )
}

export default withGame(Line4)