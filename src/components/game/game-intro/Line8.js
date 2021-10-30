import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line8Timeline } from '../game-animations/TimelineAnimations'

const Line8 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line8Timeline()
        setTimeout(() => {
            setCurrentIntroLine(9)
        }, 3500)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> Are you ready? </p>
    )
}

export default withGame(Line8)