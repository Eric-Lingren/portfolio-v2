import React, { useEffect, useRef, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { TweenLite, TweenMax, Linear, Cubic } from 'gsap'
import { withGame } from '../providers/GameProvider'
import invaderLogo from '../assets/invader-logo2.png'
import useSound from 'use-sound';
import mouseoverSound from  '../assets/audio1.wav'
// import bKey from '../assets/B-icon.png'
// import sKey from '../assets/S-icon.png'
// import { homeLogoAnimation } from '../helpers/animation-helpers/HomeAnimations'



const Home = ({  setIsPlaying, setCustomAlert, setDidSkip }) => {
    let history = useHistory()
    const canvasRef = useRef()
    const fullExpereienceButton = useRef()
    const standardExpereienceButton = useRef()
    const [play] = useSound(mouseoverSound)

    // const mouseoverSound = new Audio('../assets/audio1.wav')
    // mouseoverSound.play() 
    // const playSoundEffect = () => {
    //     useSound(mouseoverSound)
    // }

    useEffect(() => {
        // mouseoverSound.play() 
        // Animates Full Green Button
        TweenLite.to(fullExpereienceButton.current, .75, {
            backgroundColor:"#55942b", 
            boxShadow: '0px 0px 10px 8px #fff',
            ease: Linear.easeNone,
            yoyo: true,
            repeat: -1,
        })
        // Animates Yellow Standard Button
        TweenLite.to(standardExpereienceButton.current, .75, {
            backgroundColor:"#E59400", 
            boxShadow: '0px 0px 10px 8px #fff',
            ease: Linear.easeNone,
            yoyo: true,
            repeat: -1,
        })
    })

    // Animated Pixelate-Out of Logo
    useEffect(()=> {
        const scale = { value: 25 }
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.imageSmoothingEnabled = false
        canvas.style.width='50vw'
        canvas.style.height='50vh'
        canvas.width  = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        const initAnimitaion = () => {
            TweenMax.from(scale, 4, {
                value: 1,
                ease: Linear.easeNone,
                onUpdate: update,
                repeat: 0,
                autoAlpha: 1,
                delay: 2
            });
            TweenMax.to(canvas, 3, { autoAlpha: 0, delay: 3 })
            update()
        }

        const img = new Image()
        img.onload = initAnimitaion
        img.src = invaderLogo  

        const update = () => {
            var sw = (canvas.width / scale.value) >> 0
            var sh = (canvas.height / scale.value) >> 0
            ctx.drawImage(img, 0, 0, sw, sh);
            ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, canvas.width, canvas.height) 
        } 
    })

    const handleInitilizeSite = (e) => {
        const { value } = e.target
        if(value === 'full'){
            setIsPlaying(true, history)
            setCustomAlert('')
        }
        else {
            setIsPlaying(false)
            setDidSkip(true, history)
            setCustomAlert('')
        }
    }


    return(
        <div className='home-wrapper'>
            <canvas className='home-canvas' ref={canvasRef} />

            <div className='home-button-container'>
                <button 
                    className='eightbit-btn' 
                    ref={fullExpereienceButton}
                    value='full'
                    onClick={handleInitilizeSite}
                    onMouseEnter={play}
                > 
                    Full Expereince 
                </button>
                <button 
                    className='eightbit-btn eightbit-btn--proceed'
                    ref={standardExpereienceButton}
                    value='standard'
                    onClick={handleInitilizeSite}
                    onMouseEnter={play}
                > 
                    Standard Site 
                </button>
            </div>
            {/* <button 
                    className='eightbit-btn' 
                    ref={fullExpereienceButton}
                    value='full'
                    onClick={handleInitilizeSite}
                    onMouseEnter={play}
                > 
                    Full Expereince 
                </button> */}
        </div>
    )
}

export default withGame(Home)