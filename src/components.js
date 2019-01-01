import React, { Component } from 'react';


//array defining drum keys, sounds, names, and keys for React array mapping
const keylist =[
  {
  keyName: 'Q',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3',
  keyPress: 'q',
  name: 'Heater 1'
}, {
  keyName: 'W',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3',
  keyPress: 'w',
  name: 'Heater 2'
}, {
  keyName: 'E',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3',
  keyPress: 'e',
  name: 'Heater 3'
}, {
  keyName: 'A',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-4_1.mp3',
  keyPress: 'a',
  name: 'Heater 4'
}, {
  keyName: 'S',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3',
  keyPress: 's',
  name: 'Clap'
}, {
  keyName: 'D',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3',
  keyPress: 'd',
  name: 'Open HH'
}, {
  keyName: 'Z',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3',
  keyPress: 'z',
  name: 'Kick-n-hat'
}, {
  keyName: 'X',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3',
  keyPress: 'x',
  name: 'Kick'
}, {
  keyName: 'C',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3',
  keyPress: 'c',
  name: 'Closed HH'
}

]

/* Pad Components */

//Top level container for pads and power.
//This component maintains state that needs to be passed between those two subcomponents.
//Also contains bound functions for updating it's state from the sub-components.
class DrumMachine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      volume : 5,
      power : true,
      // volumeProp value is derived from volume and power. need to persist volume seperately to preserve the value of the input widget
      volumeProp: 5,
      lastPlayed: 'heater'
    };
    this.handleVolChange = this.handleVolChange.bind(this);
    this.handlePowerToggle = this.handlePowerToggle.bind(this);
    this.handleNameUpdate = this.handleNameUpdate.bind(this);
  }

  handleVolChange(e) {
    this.setState({volume: e.target.value});
    if(this.state.power) { //if power is currently on, update the volumeProp passed down to children.
      this.setState({ volumeProp : e.target.value}); //can't use state.volume instead of e.target.value b/c state updates are batched.
    }
  }

  handlePowerToggle(e) {
    if(this.state.power) { //if power is currently on, turn it off by setting volumeprop to zero
      this.setState({power : false, volumeProp : 0});
    } else { //if power is off, turn back on by setting the value of volumeProp to the value of the input
      this.setState({power : true, volumeProp : this.state.volume });
    }
  }

  handleNameUpdate(name) {
    this.setState({ lastPlayed : name });
  }

  render() {

    return (
    <div className="titleContainer">
      <h1><i className="fas fa-music"></i>Soundboard</h1>
      <div className='DrumMachine'>
        <PadPanel
          volume={this.state.volumeProp}
          handleNameUpdate={this.handleNameUpdate}
        />
        <Controls
          volume={this.state.volume}
          handleVolChange={this.handleVolChange}
          handlePowerToggle={this.handlePowerToggle}
          power={this.state.power}
          lastPlayed={this.state.lastPlayed}
        />
      </div>
    </div>
  );}
}

//Grid of pads from array above.
class PadPanel extends Component {
  render() {
    const volume = this.props.volume/10; //warning - this is hardcoded to 10; see the volume controls--max is 10, required increment is 1. but htmlaudio elements only accept 0-1, so had to divide to 10, must adjusting this if adjusting max volume
    const handleNameUpdate = this.props.handleNameUpdate
    return (
      <div className='PadPanel'>
        {keylist.map(function(x) {
          return <Pad
            sound={x.url}
            padKey={ x.keyName }
            key={x.keyName}
            volume={volume}
            keyPress={x.keyPress}
            handleNameUpdate={handleNameUpdate}
            name={x.name}
          />;
        }
        )}
      </div>
    )
  }
}

//Component for each individual pads
class Pad extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pressed : false //used to visually actuate pad on keypress, see onKeypress() below
    };
    this.play = this.play.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.setName = this.setName.bind(this);
  }

  //function to update LastPlayed state in DrumMachine component, which updates Display control of what sound played.
  //setName is bound to each pad in order to access the local name prop, because it will be called in another function.
  setName() {
    const lastPlayed = this.props.name;
    this.props.handleNameUpdate(lastPlayed);
  }

  //Function to play sound, called onClick. Also updates the display state w/ setName
  play() {
    this.setName()
    const mySound = new Audio(this.props.sound);
    mySound.volume = this.props.volume;
    mySound.play();
  }

  //Had to write a separate solution for playing sound on keyPress because I'm manually managing pad state in order to visually actuate the pads.
  onKeyPress(e) {
    //console.log(this);
    if(e.key.toLowerCase() === this.props.keyPress) {
      this.setState({ pressed : true }, //set state to true in order to translate button down
        //callback function so that setState & visual actuation of pad happens before sound plays. Otherwise, state change would happen asynchronously and pad would actuate after sound plays.
        () => {
          this.setName() //update display
          const mySound = new Audio(this.props.sound);
          mySound.volume = this.props.volume;
          mySound.play();
        });
      setTimeout(() => {this.setState({ pressed :false });}, 100); //timeout for resetting state to pressed:false, so that button stays translated down for a bit.
    }
  }


  //lifecycle events to add document-level event listeners to make pads keyboard accessible.
  componentDidMount() {
    document.addEventListener('keypress', this.onKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this.onKeyPress)
  }

  render() {
    const padKey = this.props.padKey;
    return (
      <div
        className={this.state.pressed ? 'pad keyPressedPad' : 'pad' }
        onClick={this.play}
        tabIndex='0'
        >
        <div className='letter'>{padKey}</div>
      </div>
    );}
}

/* Control Components*/

//container for control components
class Controls extends Component {
  render() {
    const volume = this.props.volume;
    return (
      <div className="Controls">
        <div className='powerLabel'>Power</div>
        <Power power={this.props.power} handlePowerToggle={this.props.handlePowerToggle}/>
        <Display lastPlayed={this.props.lastPlayed}/>
        <VolumeControl volume={volume} handleVolChange={this.props.handleVolChange}/>
      </div>);
  }
}

class Power extends Component {
  render() {
    const power = this.props.power;
    const stateClasses = ['on', 'off'];
    return (
      <div onClick={this.props.handlePowerToggle}>
        <div className={'controlItem powerSwitch ' + (power ? stateClasses[0] : stateClasses[1])}>
          <div className='switchToggle'></div>
        </div>
      </div>
    );
  }
}

class Display extends Component {
  render() {
    const lastPlayed = this.props.lastPlayed;
    return (
      <div className='controlItem Display'>
          <div className='soundLabel'>{lastPlayed}</div>
      </div>);
    }
}

class VolumeControl extends Component {
    render() {
      const volume = this.props.volume;
      return (
        <div className="volumeControl controlItem">
          <input
            type="range" min="0" max="10" //if you change this, change the formula under padpanel volume calc
            value={volume}
            onChange={this.props.handleVolChange}>
          </input>
        </div>
      );
    }
}

export default DrumMachine;
