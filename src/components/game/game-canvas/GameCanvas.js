import React, { useState, useEffect, useRef } from 'react'
import shooterImage from '../../../assets/shooter.png'
import bulletImage from '../../../assets/bullet.png'


const GameCanvas = () => {
    let isShooting = false
    let id;
    let bulletInterval;
    const gameCanvasRef = useRef()
    const shooterRef = useRef()
    const bulletRef = useRef()

    useEffect(() => {
        window.addEventListener('keydown', handleKeyboardInput)
        const canvas = gameCanvasRef.current
        const ctx = canvas.getContext("2d")
        canvas.style.width='99vw'
        canvas.style.height='80vh'
        canvas.width  = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        const cw = canvas.width
        const ch = canvas.height
        let initialX = (cw/2)-25
        let initialY = (ch-80)

        let shooterIcon = shooterRef.current
        shooterIcon.attributes[0].value = initialX
        shooterIcon.attributes[1].value = initialY
        
        shooterIcon.onload = () => {
            ctx.drawImage(shooterIcon, initialX, initialY, 100, 65)
        }
    })

    const handleKeyboardInput = (e) => {
        e.preventDefault()
        const shooterIcon = shooterRef.current
        let shooterPositionX = Math.floor(shooterIcon.attributes[0].value)
        let shooterPositionY = Math.floor(shooterIcon.attributes[1].value)

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
    }

    const moveShooter = ( xPosition, yPosition ) => {
        const canvas = gameCanvasRef.current
        let isOutOfBounds = false

        if((xPosition+100 > canvas.width) || (xPosition < 0 )) isOutOfBounds = true
        if(!isOutOfBounds) drawShooter(xPosition, yPosition)
    }

    const drawShooter = (newPositionX, newPositionY) => {
        let xPosition;
        let yPosition;
        const canvas = gameCanvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0,0, 1287,657)
        const shooterIcon = shooterRef.current
        newPositionX ? xPosition = newPositionX : xPosition = shooterIcon.attributes[0].value
        newPositionY ? yPosition = newPositionY : yPosition = shooterIcon.attributes[1].value
        setShooterCoordinates(xPosition, yPosition)
        ctx.drawImage(shooterIcon, xPosition, yPosition, 100, 65)
    }

    const setShooterCoordinates = (x, y) => {
        const shooterIcon = shooterRef.current
        shooterIcon.attributes[0].value = x
        shooterIcon.attributes[1].value = y
    }

    const shoot = () => {
        console.log('shoot ran')
        isShooting = true
        const bullet = bulletRef.current
        const shooterIcon = shooterRef.current
        const shooterPositionX = Math.floor(shooterIcon.attributes[0].value)
        const shooterPositionY = Math.floor(shooterIcon.attributes[1].value)
        const bulletXPosition = shooterPositionX+45
        const bulletYPosition = shooterPositionY-40
        setBulletCoordinates(bulletXPosition, bulletYPosition)
        // id = setInterval(drawBullet, 10)
        startBulletInterval()
    }
    
    const startBulletInterval = () => {
        bulletInterval = setInterval(drawBullet, 10)
    }

    let count = 0

    const drawBullet = () => {
        const canvas = gameCanvasRef.current
        const ctx = canvas.getContext("2d")
        const bullet = bulletRef.current
        count++

        if(!isShooting){
            clearInterval(bulletInterval)
        }
        
        let xPosition = bullet.attributes[0].value
        let yPosition = Math.floor( parseInt(bullet.attributes[1].value) - 10 )
        ctx.clearRect(0,0, 1287,657)
        setBulletCoordinates(xPosition, yPosition)
        drawShooter()
        ctx.drawImage(bullet, xPosition, yPosition, 10, 35)

        if(yPosition < -18 ){
            isShooting = false
            count = 0
        }
    }

    const setBulletCoordinates = (x, y) => {
        // console.log(y)
        const bullet = bulletRef.current
        bullet.attributes[0].value = x
        bullet.attributes[1].value = y
    }
    

    return(
        <div className='game-canvas-container'>
            <canvas className='game-canvas' ref={gameCanvasRef} />
            <img 
                positionx={0}
                positiony={0}
                ref={shooterRef}
                className='shooter-icon hide-shooter' 
                alt='lives-icon' 
                src={shooterImage} />
            <img 
                positionx={0}
                positiony={0}
                ref={bulletRef}
                className='bullet' 
                alt='bullet-icon' 
                src={bulletImage} />
        </div>
    )
}

export default GameCanvas