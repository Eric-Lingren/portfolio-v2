import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line3Timeline } from '../TimelineAnimations'

const Line5 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line3Timeline()
        setTimeout(() => {
            setCurrentIntroLine(6)
        }, 3000)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> COMPETENT </p>
    )
}

export default withGame(Line5)