import './App.css';
import React, { Component} from 'react';
import logo from './Assets/Logo.jpg'
import MainView from './Components/MainView/MainView';


export default class MainApp extends Component {
  constructor(props){
    super(props);
    this.state ={
      applicationView:''
    }
  }

  setView(area){
    this.setState({applicationView:area})
  }
  componentDidMount(){
  }

  render(){
      return (
        <div id="Main">
          {(this.state.applicationView=="")?
          (<div id='SelectionView'>
              <div id='SelectionTop'>
                <img id ="logoSelection" src={logo}></img>
                <div id='SelectionAreaTitle'>Select<br/>Mosque Area</div>
              </div>
              <div id='ButtonArea'>
                <button id='Main Hall' className='ViewButton' onClick={()=>{this.setView("Main Hall")}}>Main Hall</button>
                <button id='Hallway' className='ViewButton' onClick={()=>{this.setView("Hallway")}}>Hallway</button>
              </div>
            </div>)
            :
            (<MainView MosqueArea={this.state.applicationView}/>)}
          </div>
    );
  }
}