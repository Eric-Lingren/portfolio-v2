import React, { Component } from 'react';

const GameContext = React.createContext()

class GameProvider extends Component {
    constructor(){
        super()
        this.state = {
            isPlaying: false,
            didSkip: null,
            firstMount: 0,
            customAlert: '',
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


    render(){
        return (
            <GameContext.Provider 
                value={{
                    ...this.state,
                    setIsPlaying: this.setIsPlaying,
                    setDidSkip: this.setDidSkip,
                    setCustomAlert: this.setCustomAlert,
                    
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