import { useState, useEffect } from 'react'
import { withGameComponent } from '../../../providers/GameComponentProvider'


// const ScoreComponent = (props) => {
const ScoreComponent = ({ score, fetchScore }) => {

    // const [localScore, setLocalScore] = useState(score)
    // console.log(localScore)

    useEffect(() => {
        console.log('mounted')
        // setLocalScore(score)
    }, [ score ] )
    console.log(score)
    // console.log(props)



    return(
        <>
            <h2 className='game-labels'> Score: </h2> 
            {/* <h2 className='game-labels'> {localScore} </h2> */}
            <h2 className='game-labels'> 0 </h2>
        </>
    )
}

export default withGameComponent(ScoreComponent)