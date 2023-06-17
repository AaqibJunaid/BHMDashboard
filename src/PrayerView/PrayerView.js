import './PrayerView.css';
import React, { Component} from 'react';
import logo from '../Assets/Logo.jpg'

export default class PrayerView extends Component {

    constructor(props){
      super(props);
      this.state ={
        hours:0,
        minutes:0,
        seconds:0
      }
    }

    componentDidMount(){
        if (this.props.CountDown !== 'i'){
            this.setState({hours:'01',minutes:'02',seconds:'03'})
        }
    }


    render(){
        return (
            <div id='PrayerView'>
                <div id='TopPanel'>
                    <div id='LogoArea'>
                            <img id='Logo' src={logo}></img>
                    </div>
                    <div id='Prayer'>
                        <div id ='PrayerName'>{this.props.PrayerName.English}</div>
                        <div id='Type'>{this.props.PrayerName.Type + ' in ...'}</div>
                    </div>
                </div>
                <div id='CountDown'>
                    {this.props.CountDown}
                </div>
            </div>
        )
    }
}