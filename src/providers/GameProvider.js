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
            score: 0,
            lives: 3
        }
    }

    setIsPlaying = (isPlaying, history) => {
        this.setState({ isPlaying : isPlaying })
        if(isPlaying === true && this.state.firstMount === 0) history.push('/game')
    }

    setDidSkip = (didSkip, history) => {
        this.setState({ didSkip : didSkip })
        history.push('/work')
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


    render(){
        return (
            <GameContext.Provider 
                value={{
                    ...this.state,
                    setIsPlaying: this.setIsPlaying,
                    setDidSkip: this.setDidSkip,
                    setCustomAlert: this.setCustomAlert,
                    setCurrentIntroLine: this.setCurrentIntroLine,
                    setToggleIsInGameMode: this.setToggleIsInGameMode
                    
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