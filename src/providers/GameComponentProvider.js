import React, { Component } from 'react';

const GameComponentContext = React.createContext()

let score = 0

class GameComponentProvider extends Component {
    constructor(){
        super()
        this.state = { 
            // score: 0,
        }
        
    }
    


    setScore = (newScore) => {
        console.log('setting new score')
        score = score + newScore
        console.log(score)
        // this.setState({score: newScore})
    }

    fetchScore = () => {
        console.log('ran')
    }


    render(){
        console.log(score)
        return (
            <GameComponentContext.Provider 
                value={{
                    ...this.state,
                    setScore: this.setScore,
                    fetchScore: this.fetchScore,
                    score: score
                }}>
                { this.props.children }
            </GameComponentContext.Provider>
        )
    }
}

export default GameComponentProvider

export const withGameComponent = C => props => (
    <GameComponentContext.Consumer>
        {value => <C {...props} {...value}/>}
    </GameComponentContext.Consumer>
)