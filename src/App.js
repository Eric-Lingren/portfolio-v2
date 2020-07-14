import React from 'react';
import { Switch, Route } from 'react-router-dom'
import './App.js';
import Navbar from './components/Navbar'
import Home from './components/Home'
import Work from './components/work/Work'
import GameHome from './components/game/GameHome'


const App = () => {
  
  return (
    <div className="App">
      <h1> Portfolio </h1>
      <Navbar />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/work' component={Work} />
        <Route path='/game' component={GameHome} />
      </Switch>

    </div>
  );
}

export default App;
