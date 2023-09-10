import './PrayerView.css';
import React, { Component} from 'react';
import logo from '../../Assets/Logo.jpg'
import { getLongDate,getCurrentTime } from '../../Functions/Date Functions';

export default class PrayerView extends Component {

    constructor(props){
      super(props);
      this.state ={
      }
    }

    generateBottom(){
        if (this.props.activatePrayerHold){
            if(this.props.hijriDateFlag==true && this.props.hijriDate!=="Unkown" && this.props.hijriDate!==""){

                var dateArray= this.props.hijriDate.split('\n')
                return(
                    <div id='BottomPanel'>
                        <div id='TodayDate'>{dateArray[0]}<br/>{dateArray[1]}</div>
                        <div id='Clock'>{getCurrentTime()}</div>
                    </div>
                )
            }
            else{
                var dateArray= getLongDate().split('\n')
                // var endPortion = dateArray.slice(1,dateArray.length).join(' ')
                return(
                    <div id='BottomPanel'>
                        <div id='TodayDate'>{dateArray[0]}<br/>{dateArray[1]}</div>
                        <div id='Clock'>{getCurrentTime()}</div>
                    </div>
                )
            }
        }
        else{
            var seconds=this.props.CountDown.substr(0,2)
            return(
                <div id='CountDown'>{seconds}</div>
            )    
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
                        <div id='Type'>{this.props.PrayerName.BottomText}</div>
                    </div>
                </div>
                {this.generateBottom()}
            </div>
        )
    }
}