import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import DrumMachine from './components.js'
import './components.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <DrumMachine />
      </div>
    );
  }
}

export default App;
