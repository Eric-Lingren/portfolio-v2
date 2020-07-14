import React, { useEffect, useRef, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { TweenLite } from 'gsap'
import { withGame } from '../providers/GameProvider'
import bKey from '../assets/B-icon.png'
import sKey from '../assets/S-icon.png'



const Home = ({  setIsPlaying, isPlaying, setCustomAlert, setDidSkip, didSkip, location }) => {
    let history = useHistory();
    const beginText = useRef()


    const handleInitilizeGame = useCallback(
        (e) => {
            if(e.key === 'b' || e.key === 'B' ){
                setIsPlaying(true, history)
                setCustomAlert('')
            }
            else if(e.key === 's' || e.key === 'S' ){
                setIsPlaying(false)
                setDidSkip(true, history)
                setCustomAlert('')
            } else {
                setCustomAlert('Please press a valid key...')
            }
        }, [ history, setIsPlaying, setDidSkip, setCustomAlert ]
    )

    useEffect(() => {
        window.addEventListener('keydown', handleInitilizeGame)
    }, [handleInitilizeGame])

    useEffect(() => {
        return () => window.removeEventListener('keydown', handleInitilizeGame)
    }, [handleInitilizeGame])

    useEffect(() => {
        TweenLite.to(beginText.current, 2, {autoAlpha:0})
        TweenLite.to(beginText.current, 2, {autoAlpha:1, delay:1, repeat: -1})
    })


    return(
        <div>
            <div ref={beginText} className='game-message'>
                <span> Press <img className='key' src={sKey} alt='keyboard-s-key' /> to skip </span>
                <p> Or <img className='key' src={bKey} alt='keyboard-b-key' /> to begin... </p>
            </div>
        </div>
    )
}

export default withGame(Home)