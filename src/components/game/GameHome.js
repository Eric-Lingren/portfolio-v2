import React from 'react'
import { withGame } from '../../providers/GameProvider'
import GameIntro from './game-intro/GameIntro'
import GameCanvas from './game-canvas/GameCanvas'

const GameHome = ({isInGameMode}) => {

    return(
        <div>
            { !isInGameMode && <GameIntro /> }
            { isInGameMode && <GameCanvas /> }
        </div>
    )
}

export default withGame(GameHome)