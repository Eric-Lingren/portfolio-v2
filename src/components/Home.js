import React, { useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { TweenLite, TweenMax, Linear } from 'gsap'
import { withGame } from '../providers/GameProvider'
import invaderLogo from '../assets/invader-logo2.png'
// import mouseoverSound from  '../assets/audio1.wav'

const Home = ({  setIsPlaying, setCustomAlert, setDidSkip }) => {
    // const [windowWidth, setWindowWidth] = useState(0)
    let history = useHistory()
    const canvasRef = useRef()
    const fullExpereienceButton = useRef()
    const standardExpereienceButton = useRef()
    // const mouseoverAudio = new Audio(mouseoverSound)

    useEffect(() => {
        // setWindowWidth(window.innerWidth)
        TweenLite.to(fullExpereienceButton.current, .75, {
            backgroundColor:"#55942b", 
            boxShadow: '0px 0px 10px 8px #fff',
            ease: Linear.easeNone,
            opacity: 1,
            yoyo: true,
            repeat: -1,
            delay: 3
        })
        // Animates Yellow Standard Button
        // TweenLite.to(standardExpereienceButton.current, .75, {
        //     backgroundColor:"#E59400", 
        //     boxShadow: '0px 0px 10px 8px #fff',
        //     ease: Linear.easeNone,
        //     opacity: 1,
        //     yoyo: true,
        //     repeat: -1,
        //     delay: 3,
        // })
        TweenLite.fromTo(standardExpereienceButton.current, .75, 
            {
                backgroundColor:"#E59400", 
                boxShadow: '0px 0px 10px 8px #fff',
                ease: Linear.easeNone,
                opacity: .25,
                yoyo: true,
                repeat: -1,
                delay: 3,
            },{
                backgroundColor:"#E59400", 
                boxShadow: '0px 0px 10px 8px #fff',
                ease: Linear.easeNone,
                opacity: 1,
                yoyo: true,
                repeat: -1,
                delay: 3,
            }
        )
    }, [])

    // Animated Pixelate-Out of Logo
    useEffect(()=> {
        const scale = { value: 25, opacity: 0 }
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.imageSmoothingEnabled = false
        let canvasWidth;
        let canvasHeight;

        if( window.innerWidth < 430){
            canvasWidth = '90vw'
            canvasHeight = '90vw'
        }else if(window.innerWidth < 430 && window.innerWidth < 1400 ){
            canvasWidth = '50vw'
            canvasHeight = '50vw'
        }else{
            canvasWidth = '50vw'
            canvasHeight = '35vw'
        }

        canvas.style.width = canvasWidth
        canvas.style.height = canvasHeight
        canvas.width  = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        const initAnimitaion = () => {
            TweenMax.from(scale, 4, {
                value: 1,
                ease: Linear.easeNone,
                onUpdate: update,
                repeat: 0,
                opacity: 1,
                delay: .5
            });
            TweenMax.to(canvas, 3, { opacity: 0, delay: 1, zIndex: 0 })
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
        if(value === 'game'){
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
                {/* {
                    windowWidth > 430 ? 
                    <button 
                        className='eightbit-btn' 
                        ref={fullExpereienceButton}
                        value='game'
                        onClick={handleInitilizeSite}
                        // onMouseEnter={() => mouseoverAudio.play()}
                    > 
                        Gamified Site 
                    </button>
                : 
                    <button 
                        className='eightbit-btn mobile-button' 
                        ref={fullExpereienceButton}
                        value='game'
                        // onMouseEnter={() => mouseoverAudio.play()}
                    > 
                        Game Not Available on Mobile
                    </button>
                } */}
                <button 
                    className='eightbit-btn eightbit-btn--proceed'
                    ref={standardExpereienceButton}
                    value='standard'
                    onClick={handleInitilizeSite}
                    // onMouseEnter={() => mouseoverAudio.play()}
                > 
                    Standard Site 
                </button>
            </div>
        </div>
    )
}

export default withGame(Home)