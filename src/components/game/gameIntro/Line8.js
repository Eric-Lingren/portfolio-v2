import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line7Timeline } from '../TimelineAnimations'

const Line8 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line7Timeline()
        setTimeout(() => {
            setCurrentIntroLine(9)
        }, 3500)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> Are you ready? </p>
    )
}

export default withGame(Line8)