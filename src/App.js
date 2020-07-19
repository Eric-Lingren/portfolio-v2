import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import Work from './components/work/Work'
import GameHome from './components/game/GameHome'


const App = () => {
  
  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/work' component={Work} />
        <Route path='/game' component={GameHome} />
      </Switch>
    </div>
  )
}

export default App
