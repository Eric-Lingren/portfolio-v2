import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { withGame } from '../providers/GameProvider'
import portfolioLogo from '../assets/portfolio-logo-name.png'
import playerIcon from '../assets/player.png'
import ScoreComponent from './game/game-componentes/ScoreComponent'

const Header = ({ isInGameMode, lives }) => {

    const [livesIcons, setLivesIcons] = useState([])

    useEffect(() => {
        let livesList = []
        for(let i=0; i < lives; i++){
            livesList.push(i)
        }
        setLivesIcons(livesList) 
    }, [ lives ] )


    const mappedLives = livesIcons.map( icon => {
        return <img key={icon} className='player-icon' alt='lives-icon' src={playerIcon} />
    })


    return(
        <div className='header-wrapper'>
            <div className='score-container'>
            { isInGameMode &&  <ScoreComponent /> }
            </div>
            <div className='header-logo-container'>
                <Link to='/'>
                    <img className='header-logo' alt='eric-lingren-logo' src={portfolioLogo} />
                </Link>
            </div>
            <div className='lives-container'>
            { isInGameMode && 
                <>
                    <h2 className='game-labels'> Lives: </h2> 
                    <div className='lives-icons-container'>
                    { lives > 0 ? mappedLives : <h2 className='game-labels'> {lives} </h2> }
                    </div>
                </>
            }
            </div>
            
        </div>
    )
}

export default withGame(Header)