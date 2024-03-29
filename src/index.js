import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './stylesheets/main.scss'
import GameProvider from './providers/GameProvider'
import GameComponentProvider from './providers/GameComponentProvider'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <GameProvider>
        <GameComponentProvider>
          <App />
        </GameComponentProvider>
      </GameProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
