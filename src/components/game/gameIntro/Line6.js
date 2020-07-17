import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line3Timeline } from '../TimelineAnimations'

const Line6 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line3Timeline()
        setTimeout(() => {
            setCurrentIntroLine(7)
        }, 3000)
    })

    return(
        <p className='intro-text-line animate-typewriter-cursor test'> EXCEPTIONAL </p>
    )
}

export default withGame(Line6)