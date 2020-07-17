import React, { useEffect } from 'react'
import { withGame } from '../../../providers/GameProvider'
import { line1Timeline } from '../TimelineAnimations'

const Line1 = ({ setCurrentIntroLine }) => {

    useEffect(() => {
        line1Timeline()
        setTimeout(() => {
            setCurrentIntroLine(2)
        }, 2500)
    })

    return(
        <p className="intro-text-line animate-typewriter-cursor"> Greetings... </p>
    )
}

export default withGame(Line1)