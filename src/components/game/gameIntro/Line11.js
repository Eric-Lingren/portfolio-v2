import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line7Timeline } from '../TimelineAnimations'

const Line11 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line7Timeline()
        // setTimeout(() => {
        //     setCurrentIntroLine(4)
        // }, 3000)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> Press any key to begin... </p>
    )
}

export default withGame(Line11)