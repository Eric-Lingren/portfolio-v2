import React, { Component } from 'react';

const GameContext = React.createContext()

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




    render(){
        return (
            <GameContext.Provider 
                value={{
                    ...this.state,
                    setIsPlaying: this.setIsPlaying,
                    setDidSkip: this.setDidSkip,
                    setCustomAlert: this.setCustomAlert,
                    setCurrentIntroLine: this.setCurrentIntroLine,
                    setToggleIsInGameMode: this.setToggleIsInGameMode,
                    setIsLevelPlaying: this.setIsLevelPlaying
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