import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line3Timeline } from '../TimelineAnimations'

const Line3 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line3Timeline()
        setTimeout(() => {
            setCurrentIntroLine(4)
        }, 3000)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> TALENTED </p>
    )
}

export default withGame(Line3)