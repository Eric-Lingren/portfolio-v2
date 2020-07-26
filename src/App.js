import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import GameHome from './components/game/GameHome'
import StandardHome from './components/standard/StandardHome'


const App = () => {
  
  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/standard' component={StandardHome} />
        <Route path='/game' component={GameHome} />
      </Switch>
    </div>
  )
}

export default App
