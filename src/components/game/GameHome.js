import React, { useEffect } from 'react'
import { 
    // gameTextLine1Animation,
    // gameTextLine2Animation 
    introTimeline
} from './TimelineAnimations'

const GameHome = () => {

    useEffect(() => {
        introTimeline()
        // gameTextLine1Animation()
        // gameTextLine2Animation()
    })


    return(
        <div>
            
            Im the game Home
            <p className="line-1 animate-typewriter-cursor"> Greetings... </p>
            <p className="line-2 animate-typewriter-cursor2"> You have been selected to find a </p>
            <p className="line-3 animate-typewriter-cursor3"> TALENTED </p>
            <p className="line-4 animate-typewriter-cursor4"> SKILLFUL </p>
            <p className="line-5 animate-typewriter-cursor5"> COMPETENT </p>
            <p className="line-6 animate-typewriter-cursor6"> EXCEPTIONAL </p>
            <p className="line-7 animate-typewriter-cursor7"> Full Stack Developer </p>
        </div>
    )
}

export default GameHome