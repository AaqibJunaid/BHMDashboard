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
                <button id='Poll' className='ViewButton' onClick={()=>{this.setView("Poll")}}>Poll</button>              
                {/* <button id='Main Hall' className='ViewButton' onClick={() =>  {window.location.href='/mainhall'}}>Main Hall</button>
                <button id='Hallway' className='ViewButton' onClick={() =>  {window.location.href='/hallway'}}>Hallway</button>
                <button id='Poll' className='ViewButton' onClick={() =>  {window.location.href='/poll'}}>Poll</button> */}
              </div>
            </div>)
            :
            (<MainView MosqueArea={this.state.applicationView}/>)}
          </div>
    );
  }
}