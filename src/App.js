import { useCallback } from "react";
import { Switch, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import GameHome from './components/game/GameHome'
import StandardHome from './components/standard/StandardHome'
import WorkDetails from './components/standard/work/WorkDetails'


// import Particles from "react-particles";
// import type { Engine, ISourceOptions } from "tsparticles-engine"
// import { loadFull } from "tsparticles"
// import { loadPolygonMaskPlugin } from "tsparticles-plugin-polygon-mask"

// import Particle from './Particle'


const App = () => {
 


  return (
    <div className="App">
    {/* <Particle /> */}
      {/* <Particles options={particleConfig} init={particleInit} /> */}
      {/* <Particles id="tsparticles" options={options} init={particlesInit} /> */}
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/standard/work-details/:id" component={WorkDetails} />
        <Route path="/standard" component={StandardHome} />
        <Route path="/game" component={GameHome} />
      </Switch>
    </div>
  );
}

export default App
































