import React, { Component } from 'react';

const GameContext = React.createContext()
let gameScore = 0
class GameProvider extends Component {
    constructor(){
        super()
        this.state = { 
            isPlaying: false,
            isInGameMode: false,
            didSkip: null,
            firstMount: 0,
            customAlert: '',
            currentIntroLine : 1,
            // score: 0,
            lives: 3,
            level: 10,
            isLevelPlaying: true,
            // enemies: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }
    }
    

    setIsPlaying = (isPlaying, history) => {
        this.setState({ isPlaying : isPlaying })
        if(isPlaying === true && this.state.firstMount === 0) history.push('/game')
    }

    setDidSkip = (didSkip, history) => {
        this.setState({ didSkip : didSkip })
        history.push('/standard')
    }

    setCustomAlert = (message) => {
        this.setState({ customAlert : message })
    }

    setCurrentIntroLine = (nextLine) => {
        this.setState({currentIntroLine : nextLine})
    }

    setToggleIsInGameMode = () => {
        this.setState({ isInGameMode: !this.state.isInGameMode })
    }

    setIsLevelPlaying = (playing) => {
        this.setState({isPlaying: playing})
    }

    setScore = (score) => {
        let gameScore = score
        // console.log(gameScore)
        // let currentScore = this.state.score
        // let newScore = currentScore + points
        // console.log(newScore)
        // this.setState({ score: newScore })
    }


    render(){
        return (
            <GameContext.Provider 
                value={{
                    gameScore: gameScore,
                    ...this.state,
                    setIsPlaying: this.setIsPlaying,
                    setDidSkip: this.setDidSkip,
                    setCustomAlert: this.setCustomAlert,
                    setCurrentIntroLine: this.setCurrentIntroLine,
                    setToggleIsInGameMode: this.setToggleIsInGameMode,
                    setIsLevelPlaying: this.setIsLevelPlaying,
                    setScore: this.setScore
                    
                }}>
                { this.props.children }
            </GameContext.Provider>
        )
    }
}

export default GameProvider

export const withGame = C => props => (
    <GameContext.Consumer>
        {value => <C {...props} {...value}/>}
    </GameContext.Consumer>
)