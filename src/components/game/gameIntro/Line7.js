import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line7Timeline } from '../TimelineAnimations'

const Line7 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line7Timeline()
        setTimeout(() => {
            setCurrentIntroLine(8)
        }, 4000)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> Full Stack Developer </p>
    )
}

export default withGame(Line7)