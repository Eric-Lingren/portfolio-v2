import React, { useState, useEffect, useRef, useCallback } from 'react'
import { withGame } from '../../../providers/GameProvider'
import playerImage from '../../../assets/player.png'
import bulletImage from '../../../assets/bullet.png'
import enemyBlue from '../../../assets/enemy-blue.png'
// import enemyGreen from '../../../assets/enemy-green.png'
// import enemyOrange from '../../../assets/enemy-orange.png'
// import enemyPink from '../../../assets/enemy-pink.png'
import themeSong from '../../../assets/theme-song.mpeg'
import shootSound from  '../../../assets/shoot.wav'


const GameCanvas = ({ isLevelPlaying, setIsLevelPlaying, level, setScore }) => {
    const [canvasWidth, setCanvasWidth] = useState()
    const [canvasHeight, setCanvasHeight] = useState()
    // let isShooting = false
    let bulletInterval;
    let enemyInterval;
    let currentScore = 0
    const gameCanvasRef = useRef()
    const playerRef = useRef()
    const bulletRef = useRef()
    const isShootingRef = useRef()
    const enemyBlueRef = useRef()
    const themeSongAudio = new Audio(themeSong)
    const shootAudio = new Audio(shootSound)
    let enemies = [ {x:50, y:50, row: 0}, {x:150, y:50, row: 0}, {x:250, y:50, row: 0}, {x:350, y:50, row: 0}, {x:450, y:50, row: 0}, {x:550, y:50, row: 0}, {x:650, y:50, row: 0}, {x:750, y:50, row: 0}, {x:850, y:50, row: 0}, {x:950, y:50, row: 0} ]
    // let enemies = [ {x:50, y:50, row: 0}   ]

    

    // Reusable canvas getter
    const getCanvas = useCallback (
        () => {
            const canvas = gameCanvasRef.current
            const ctx = canvas.getContext("2d")
            return ctx 
        }, []
    )

    // Reusable player getter
    const getPlayer = () => {
        const player = playerRef.current
        return player
    }

     // Reusable bullet getter
    const getBullet = () => {
        const bullet = bulletRef.current
        return bullet
    }

    // Reusable canvas wiper
    const clearCanvas = useCallback (
        () => {
            getCanvas().clearRect(0, 0, canvasWidth, canvasHeight)
        }, [getCanvas, canvasWidth, canvasHeight]
    )

    // Updates players position in the ref
    const setShooterCoordinates = useCallback(
        (x, y) => {
            getPlayer().attributes[0].value = x
            getPlayer().attributes[1].value = y
        }, []
    )

    const startEnemyInterval = () => {
        enemyInterval = setInterval(enemiesAnimationLoop, (800/level))
    }

    
    const drawEnemies = useCallback(
        () => {
            let enemy = enemyBlueRef.current
            for(let i = 0; i < enemies.length; i++ ){
                getCanvas().drawImage(enemy, enemies[i].x, enemies[i].y, 50, 45)
            } 
        }, [enemies, getCanvas]
    )

    const drawPlayer = useCallback(
        (newPositionX, newPositionY) => {
            let xPosition;
            let yPosition;
            newPositionX ? xPosition = newPositionX : xPosition = getPlayer().attributes[0].value
            newPositionY ? yPosition = newPositionY : yPosition = getPlayer().attributes[1].value
            setShooterCoordinates(xPosition, yPosition)
            clearCanvas()
            drawEnemies()
            getCanvas().drawImage(getPlayer(), xPosition, yPosition, 100, 65)
        }, [clearCanvas, drawEnemies, setShooterCoordinates, getCanvas]
    )

    const moveShooter = useCallback(
        ( xPosition, yPosition ) => {
            let isOutOfBounds = false
            if((xPosition+100 > canvasWidth) || (xPosition < 0 )) isOutOfBounds = true
            if(!isOutOfBounds) drawPlayer(xPosition, yPosition)
        }, [canvasWidth, drawPlayer]
    )


    const shoot = useCallback(
        () => {
            if(isShootingRef.current.value==='false'){
                isShootingRef.current.value=true
                shootAudio.play()
                const shooterPositionX = Math.floor(getPlayer().attributes[0].value)
                const shooterPositionY = Math.floor(getPlayer().attributes[1].value)
                const bulletXPosition = shooterPositionX+45
                const bulletYPosition = shooterPositionY-40
                setBulletCoordinates(bulletXPosition, bulletYPosition)
                startBulletInterval()
            }
        }, []
    )

    // Handles players inputs and moves
    const handleKeyboardInput = useCallback(
        (e) => {
            e.preventDefault()
            const player = playerRef.current
            let shooterPositionX = Math.floor(player.attributes[0].value)
            let shooterPositionY = Math.floor(player.attributes[1].value)

            if(e.code === 'ArrowRight'){
                shooterPositionX = shooterPositionX+25
                moveShooter(shooterPositionX, shooterPositionY)
            }
            if(e.code === 'ArrowLeft'){
                shooterPositionX = shooterPositionX-25
                moveShooter(shooterPositionX, shooterPositionY)
            }
            if(e.code === 'Space') {
                shoot()
            }
        }, [moveShooter, shoot]
    )



    // Initilize game and canvas config
    useEffect(() => {
        window.addEventListener('keydown', handleKeyboardInput)
        // themeSongAudio.play()

        let playThemePromise = themeSongAudio.play()
        if (playThemePromise !== undefined) {
            playThemePromise.then(_ => {
            })
            .catch(error => {
            })
        }

        const canvas = gameCanvasRef.current
        const ctx = canvas.getContext("2d")
        canvas.style.width='99vw'
        canvas.style.height='80vh'
        canvas.width  = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        const cw = canvas.width
        setCanvasWidth(cw)
        const ch = canvas.height
        setCanvasHeight(ch)
        let initialX = (cw/2)-25
        let initialY = (ch-80)

        let player = playerRef.current
        player.attributes[0].value = initialX
        player.attributes[1].value = initialY
        player.onload = () => {
            ctx.drawImage(player, initialX, initialY, 100, 65)
        }

        let enemy = enemyBlueRef.current
        enemy.onload = () => {
            drawEnemies()
            startEnemyInterval()
        }
        
    }, [handleKeyboardInput, themeSongAudio, drawEnemies, startEnemyInterval])

    useEffect(()=> {
        return () =>  window.removeEventListener('keydown', handleKeyboardInput)
    })
    useEffect(()=> {
        return () => themeSongAudio.pause()
    })
    useEffect(()=> {
        return () => clearInterval(enemyInterval)
    })
    useEffect(()=> {
        return () => setIsLevelPlaying(false)
    }, [setIsLevelPlaying])

    // Animates bullet shooting
    const startBulletInterval = () => {
        bulletInterval = setInterval(drawBullet, 10)
    }

    const drawBullet = () => {
        if(isShootingRef.current.value ==='false') clearInterval(bulletInterval)
        let xPosition = getBullet().attributes[0].value
        let yPosition = Math.floor( parseInt(getBullet().attributes[1].value) - 10 )
        setBulletCoordinates(xPosition, yPosition)
        clearCanvas()
        getCanvas().drawImage(getBullet(), xPosition, yPosition, 10, 35)
        // checkBulletCollision()

        if(yPosition < -18 ){
            isShootingRef.current.value = false
            setBulletCoordinates(0, -30)
        }
    }
    
    const checkBulletCollision = (currentEnemy, enemyX, enemyY) => {
        // console.log('------------------------ current enemy is ' + currentEnemy)
        const bulletX = getBullet().attributes[0].value
        const bulletY = getBullet().attributes[1].value
        if(bulletY >= enemyY && bulletY <= enemyY + 100){
            if((bulletX > (enemyX-20)) && (bulletX < (enemyX + 50))){
                console.log('--------------------  COLLISION with enemy ' + currentEnemy)
                incrementScore(100)
            }
        }
    }

    const incrementScore = (points) => {
        currentScore = currentScore+=points
        // console.log(currentScore)
        setScore(currentScore)
        // let newScore = currentScore + points
        // console.log(newScore)
        // this.setState({ score: newScore })
    }

    const setBulletCoordinates = (x, y) => {
        getBullet().attributes[0].value = x
        getBullet().attributes[1].value = y
    }

    const enemiesAnimationLoop = () => {
          if(isLevelPlaying){
            for(let i = 0; i < enemies.length; i++ ){
                // Hit Right Wall
                if(canvasWidth-75 <= enemies[i].x + 10 && (enemies[i].row % 2 === 0)){
                    enemies[i].row++
                    enemies[i].y += 50
                } 
                if(enemies[i].row % 2 !== 0){
                    enemies[i].x = enemies[i].x - 10
                }
                // Hit Left Wall
                if(25 > enemies[i].x - 10 && (enemies[i].row % 2 !== 0)){
                    enemies[i].row++
                    enemies[i].y += 50
                }
                if(enemies[i].row % 2 === 0){
                    enemies[i].x = enemies[i].x + 10
                }
                if(isShootingRef.current.value ==='true') checkBulletCollision(i, enemies[i].x, enemies[i].y)
            } 
            clearCanvas()
            drawPlayer()
            drawEnemies()
        }
    }


    return(
        <div className='game-canvas-container'>
            <canvas className='game-canvas' ref={gameCanvasRef} />
            <input ref={isShootingRef} type="text" value={false} />
            <img 
                positionx={0}
                positiony={0}
                ref={playerRef}
                className='player-icon player-hidden' 
                alt='lives-icon' 
                src={playerImage} />
            <img 
                positionx={0}
                positiony={0}
                ref={bulletRef}
                className='bullet' 
                alt='bullet-icon' 
                src={bulletImage} />
            <img 
                positionx={150}
                positiony={50}
                ref={enemyBlueRef}
                className='player-icon player-hidden' 
                alt='enemy-blue-icon' 
                src={enemyBlue} />
            {/* <img 
                positionx={0}
                positiony={0}
                ref={bulletRef}
                className='bullet' 
                alt='bullet-icon' 
                src={bulletImage} />
            <img 
                positionx={0}
                positiony={0}
                ref={bulletRef}
                className='bullet' 
                alt='bullet-icon' 
                src={bulletImage} />
            <img 
                positionx={0}
                positiony={0}
                ref={bulletRef}
                className='bullet' 
                alt='bullet-icon' 
                src={bulletImage} />
            <img 
                positionx={0}
                positiony={0}
                ref={bulletRef}
                className='bullet' 
                alt='bullet-icon' 
                src={bulletImage} /> */}
        </div>
    )
}

export default withGame(GameCanvas)