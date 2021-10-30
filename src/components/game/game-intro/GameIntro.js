import React from 'react'
import { withGame } from '../../../providers/GameProvider'
import Line1 from './Line1'
import Line2 from './Line2'
import Line3 from './Line3'
import Line4 from './Line4'
import Line5 from './Line5'
import Line6 from './Line6'
import Line7 from './Line7'
import Line8 from './Line8'
import Line9 from './Line9'
import Line10 from './Line10'
import Line11 from './Line11'

const GameIntro = ({ currentIntroLine, setCurrentIntroLine }) => {

    const introTextRenderLogic = () => {
        return <Line11 />
        // switch(currentIntroLine){
            // case 1:
            //     return <Line1 /> 
            // case 2:
            //     return <Line2 /> 
            // case 3:
            //     return <Line3 /> 
            // case 4:
            //     return <Line4 /> 
            // case 5:
            //     return <Line5 /> 
            // case 6:
            //     return <Line6 /> 
            // case 7:
            //     return <Line7 /> 
            // case 8:
            //     return <Line8 /> 
            // case 9:
            //     return <Line9 /> 
            // case 10:
            //     return <Line10 /> 
            // case 11:
                // return <Line11 /> 
            // default:
            //     break;   
        // }
    }

    return(

        <div className='game-intro-container'>
            { introTextRenderLogic() }
        </div>
    )
}

export default withGame(GameIntro)