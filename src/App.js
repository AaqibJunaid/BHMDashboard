import './App.css';
import React, { Component} from 'react';
import axios from 'axios';
import mosqueTimes from './mosqueTimes.json'
import logo from './Assets/Logo.jpg'
import PrayerView from './PrayerView/PrayerView';
import { getCurrentTime, getTodaysDate,getTomorrowDate,getLongDate } from './Functions/Date Functions';
import { nodejsEndpoint, youtubeEmbed } from './Configs/urlConfigs';
import { PrayerNames,arabicPrayerNames } from './Configs/prayerConfigs';
import { arabicSwitchMax,qrUpdateMax,prayerHoldTimesMax } from './Configs/timingConfigs';


export default class MainApp extends Component {
  constructor(props){
    super(props);
    this.state ={
      prayers:{'Fajr':'فجر','Sunrise':'شروق','Zuhur':'زهور','Asr':'عصر','Maghrib':'مغرب','Isha':'عشاء'},
      currentDynamicArea:'Main',
      switchToArabic:false,
      languageSwitchCouter:0,
      qrUpdateTimer:0,
      todayData:mosqueTimes.filter( element => element.Date === getTodaysDate())[0],
      tomorrowData:this.getTomorrowData(),
      lastKnownData:{},
      currentIslamicDate:"",
      dataStatus:"Initialising Application...",
      errorMessage:'© Blackhall Mosque Version 2.0',
      buildVersion: '© Blackhall Mosque Version 2.0',
      nextPrayer:{'EnglishName':'Fajr','Text':'Fajr In','Difference':'0h'},
      allQRCodes:[],
      QRCodes : [],
      firstQRCode:0,
      activatePrayerHold:false,
      aboutToApplyHold:false,
      holdPrayerViewCounter:0,
      holdPrayerName:'',
      holdPrayerType:'',
      elipsisCounter:0
    }
  }
  
  makePrayerList(columnName){
    var prayerLists1 = []
    var prayerLists2 = []
    
    PrayerNames.forEach(function(prayerName){

      var prayerItem;

      if (prayerName==='Sunrise'){
        prayerItem = (
          <div id={prayerName} className='PrayerTime'>
            <div id={prayerName+'Body'} className='PrayerBody'>
              <div id={prayerName+'Label'} className='PrayerName'>
                <p id ={prayerName+'LabelText'} className='PrayerNameText'>{prayerName}</p>
              </div>
              <div id={prayerName+'Start'} className='PrayerStart'>
                <p id ={prayerName+'StartText'} className='PrayerStartText'></p>
              </div>
              <div id={prayerName+'Jamat'} className='PrayerJamat'>
                <p id ={prayerName+'JamatText'} className='PrayerJamatText'>-- : --</p>
              </div>
            </div>
          </div>
        )
      }
      else{
        prayerItem = (
          <div id={prayerName} className='PrayerTime'>
            <div id={prayerName+'Body'} className='PrayerBody'>
              <div id={prayerName+'Label'} className='PrayerName'>
                <p id ={prayerName+'LabelText'} className='PrayerNameText'>{prayerName}</p>
              </div>
              <div id={prayerName+'Start'} className='PrayerStart'>
                <p id ={prayerName+'StartText'} className='PrayerStartText'></p>
              </div>
              <div id={prayerName+'Jamat'} className='PrayerJamat'>
                <p id ={prayerName+'JamatText'} className='PrayerJamatText'></p>
              </div>
            </div>
          </div>
        )
      }
      
      if (prayerName=='Fajr'){
        prayerLists1.push(prayerItem)
      }
      else if(prayerName=='Sunrise'){
        prayerLists2.push(prayerItem)
      }
      else if(prayerName == 'Zuhur'){
        prayerLists1.push(prayerItem)
      }
      else if (prayerName == 'Asr'){
        prayerLists2.push(prayerItem)
      }
      else if (prayerName == 'Maghrib'){
        prayerLists1.push(prayerItem)
      }
      else{
        prayerLists2.push(prayerItem)
      }
    })

    if (columnName == 'Column1'){
      return prayerLists1
    }
    else{
      return prayerLists2
    }

  }

  handleProgress(){
    switch (this.state.elipsisCounter){
      case 0:
        this.setState({elipsisCounter:1})
        return ''
        break;
      case 1:
        this.setState({elipsisCounter:2})
        return '.'
        break;
      case 2:
        this.setState({elipsisCounter:3})
        return '..'
        break;
      case 3:
        this.setState({elipsisCounter:0})
        return '...'
        break;
    }
  }

  manageView(){
    if (this.state.currentDynamicArea=='Main'){
      document.getElementById('MainView').style.display='flex'
      document.getElementById('PrayerView').style.display='none'
      this.updatePrayerList()
      this.syncBottomPanel()

      if(this.state.qrUpdateTimer==qrUpdateMax){
        this.updateQRCodes()
        this.setState({qrUpdateTimer:0})
      }
      else{
        this.setState({qrUpdateTimer:this.state.qrUpdateTimer+1})
      }
    }
    else{
      if (this.state.aboutToApplyHold){
        if (this.state.holdPrayerName == 'Maghrib'){
          this.setState({nextPrayer:{'EnglishName':this.state.holdPrayerName,'Text':'Jamat in progress','Difference':getCurrentTime()},holdPrayerViewCounter:this.state.holdPrayerViewCounter+1,aboutToApplyHold:false,activatePrayerHold:true})
        }
        else if(this.state.holdPrayerType=='Starts'){
          this.setState({nextPrayer:{'EnglishName':this.state.holdPrayerName,'Text':"Now Started",'Difference':getCurrentTime()},holdPrayerViewCounter:this.state.holdPrayerViewCounter+1,aboutToApplyHold:false,activatePrayerHold:true})
        }
        else{
          this.setState({nextPrayer:{'EnglishName':this.state.holdPrayerName,'Text':'Jamat in progress','Difference':getCurrentTime()},holdPrayerViewCounter:this.state.holdPrayerViewCounter+1,aboutToApplyHold:false,activatePrayerHold:true})
        }
      }
      else if(this.state.activatePrayerHold == false){
        document.getElementById('MainView').style.display='none'
        document.getElementById('PrayerView').style.display='flex'
        var todayTimes=this.state.todayData
        var nextPrayerTime = this.getNextPrayerTime(todayTimes)
        var counter = this.nextPrayerTimeDifference(nextPrayerTime)
        this.setState({nextPrayer:{'EnglishName':nextPrayerTime.Name,'Text':nextPrayerTime.Type + ' in '+this.handleProgress(),'Difference':counter}})
        
        if(counter == '00s'){
          this.setState({aboutToApplyHold:true,holdPrayerViewCounter:0,holdPrayerName:nextPrayerTime.Name,holdPrayerType:nextPrayerTime.Type,elipsisCounter:0})
        }
      }
      else{
        var prayerMaxHold = prayerHoldTimesMax[this.state.holdPrayerName+""+this.state.holdPrayerType]

        if(this.state.holdPrayerViewCounter == prayerMaxHold){
          this.setState({currentDynamicArea:'Main',activatePrayerHold:false,elipsisCounter:0})
          document.getElementById('MainView').style.display='flex'
          document.getElementById('PrayerView').style.display='none'
        }
        else{
          if (this.state.holdPrayerName == 'Maghrib'){
            this.setState({nextPrayer:{'EnglishName':this.state.holdPrayerName,'Text':'Jamat in progress','Difference':getCurrentTime()},holdPrayerViewCounter:this.state.holdPrayerViewCounter+1})
          }
          else if(this.state.holdPrayerType=='Starts'){
            this.setState({nextPrayer:{'EnglishName':this.state.holdPrayerName,'Text':"Now Started",'Difference':getCurrentTime()},holdPrayerViewCounter:this.state.holdPrayerViewCounter+1})
          }
          else{
            this.setState({nextPrayer:{'EnglishName':this.state.holdPrayerName,'Text':'Jamat in progress','Difference':getCurrentTime()},holdPrayerViewCounter:this.state.holdPrayerViewCounter+1})
          }
        }
      }
    }
  }

  updateNextPrayer(nextPrayer){
    var nextPrayerName = nextPrayer.Name
    var nextPrayerType = nextPrayer.Type
 
    var displayTime = this.nextPrayerTimeDifference(nextPrayer)

    this.setState({nextPrayer:{'EnglishName':nextPrayerName,'ArabicName':this.state.prayers[nextPrayerName],'PrayerType':nextPrayerType,'Difference':displayTime}})

    if(this.state.switchToArabic){
      var arabicName;

      for (var i=0;i<PrayerNames.length;i++){
        if (PrayerNames[i]===nextPrayerName){
          arabicName = arabicPrayerNames[i]
          break;
        }
      }  
      document.getElementById('NextPrayerNameLabel').style.paddingTop= '0%'
      document.getElementById('NextPrayerNameLabel').style.paddingLeft= '12.5%' 
      document.getElementById('NextPrayerNameLabel').style.justifyContent= 'unset' 
      document.getElementById('NextPrayerNameLabel').innerText= arabicName +'\n'+nextPrayerType +' in ...'
      document.getElementById('NextPrayerNameLabel').style.fontSize= '1.9vw' 
    }
    else{
      document.getElementById('NextPrayerNameLabel').innerText= nextPrayerName  +'\n'+nextPrayerType +' in ...' 
      document.getElementById('NextPrayerNameLabel').style.paddingTop= '2%' 
      document.getElementById('NextPrayerNameLabel').style.paddingLeft= '12.5%' 
      document.getElementById('NextPrayerNameLabel').style.justifyContent= 'unset' 
      document.getElementById('NextPrayerNameLabel').style.fontSize= '2vw' 
    }
    document.getElementById('NextPrayerTimeLabel').innerText=displayTime
  }

  updatePrayerList(){
    var todayTimes=this.state.todayData
    
    PrayerNames.forEach(function(prayerName) {
      if (prayerName ==='Sunrise'){
        document.getElementById('SunriseStartText').innerText=(todayTimes[prayerName]).substring(0,5)
      }
      else{
        document.getElementById(prayerName+'StartText').innerText=(todayTimes[prayerName+' Start']).substring(0,5)
        document.getElementById(prayerName+'JamatText').innerText=(todayTimes[prayerName+' Jamat']).substring(0,5)
      }
    })

    var currentPrayer=this.getCurrentPrayer(todayTimes)

    var backgroundColours=this.getBackgroundColours(currentPrayer.Name)
    backgroundColours.forEach(function(prayer){
        document.getElementById(prayer.Name).style.backgroundColor=prayer.Background
        document.getElementById(prayer.Name+'Jamat').style.backgroundColor=prayer.Jamat
        document.getElementById(prayer.Name+'LabelText').style.color=prayer.MainText
        document.getElementById(prayer.Name+'StartText').style.color=prayer.MainText
        document.getElementById(prayer.Name+'JamatText').style.color=prayer.JamatText
    })
  }

  updateLanguage(){
    if (this.state.switchToArabic === true){
      for (var i=0;i<PrayerNames.length;i++){
        document.getElementById(PrayerNames[i]+'LabelText').innerText=arabicPrayerNames[i]
      }      
      if(this.state.currentIslamicDate=="Unkown" ||this.state.currentIslamicDate==""){
        document.getElementById('Date').innerText=getLongDate()
        document.getElementById('Date').style.fontSize='2vw'
        document.getElementById('Date').style.paddingLeft='3%'
        document.getElementById('Date').style.transform="scaleY(1)"
      }
      else{
        document.getElementById('Date').innerText=this.state.currentIslamicDate
        document.getElementById('Date').style.fontSize='1.7vw'
        document.getElementById('Date').style.transform="scaleY(1.15)"
        document.getElementById('Date').style.paddingLeft='1%'
      }
    }
    else{
      PrayerNames.forEach(function (prayer){
        document.getElementById(prayer+'LabelText').innerText=prayer
      })
      document.getElementById('Date').innerText=getLongDate()
      document.getElementById('Date').style.fontSize='2vw'
      document.getElementById('Date').style.paddingLeft='3%'
      document.getElementById('Date').style.transform="scaleY(1)"
    }

    if(this.state.languageSwitchCouter === arabicSwitchMax){
      this.setState({switchToArabic:!this.state.switchToArabic,languageSwitchCouter:0})
    }
    else{
      this.setState({languageSwitchCouter:this.state.languageSwitchCouter+1})
    }
  }

  updateDynamicBox(){
    var todayTimes=this.state.todayData
    // if (this.state.currentDynamicArea === 'ClockDate'){
    //   document.getElementById('NextPrayerArea').style.display='none'
      document.getElementById('DateTimeArea').style.display='flex'
      document.getElementById('Time').innerText=getCurrentTime(true)
    // }
    // else{
    //   document.getElementById('DateTimeArea').style.display='none'
      document.getElementById('NextPrayerArea').style.display='flex'
      // if (holdNextPrayer == true){
      //   dynamicHoldCounter = 0
      //   document.getElementById('NextPrayerTimeLabel').innerText='Progress'
      //   if (holdCounter == 15){
      //     holdNextPrayer = false
      //     dynamicHoldCounter=9
      //     holdCounter=0
      //   }
      //   else{
      //     holdCounter++
      //   }
      // }
      // else{
        this.updateNextPrayer(this.getNextPrayerTime(todayTimes))
      // }
    // }

    // this.setState({dynamicHoldCounter:this.state.dynamicHoldCounter+1})
    //will force switch to prayer countdown if needed
    this.nextPrayerTimeDifference(this.getNextPrayerTime(todayTimes))

    // if(this.state.dynamicHoldCounter===this.state.dynamicSwitchMax){
    //   this.setState({dynamicHoldCounter:0})
    //   if(this.state.currentDynamicArea === 'ClockDate'){
    //     this.setState({currentDynamicArea:'NextPrayer'})
    //   }
    //   else{
    //     this.setState({currentDynamicArea:'ClockDate'})
    //   }
    // }
  }
  
  syncBottomPanel(){
    this.updateLanguage()
    this.updateDynamicBox()
  }

  getCurrentPrayer(times){
    var now = new Date();
    var currentPrayer;

    for (var i=0; i < PrayerNames.length;i++){

      if(PrayerNames[i]==='Fajr'){
        if (now<new Date(now.toDateString() + ' ' + times['Fajr Start'])){
            currentPrayer={'Name':'All','Index':i}
            break;
        }
      }

      if (now >= new Date(now.toDateString() + ' ' + times['Sunrise']) && now < new Date(now.toDateString() + ' ' + times['Zuhur Start'])){
        
        var sunriseTime = new Date(now.toDateString() + ' ' + times['Sunrise'])
        var timeDiff = now-sunriseTime;
    
        var hours = Math.floor(timeDiff / (1000 * 60 * 60));

        if (hours > 0){
          currentPrayer={'Name':'PastSunrise','Index':i}
        }
        else{
          currentPrayer={'Name':'Sunrise','Index':i}
        }
        break;
      }
      else{
        var startTime;
        var nextTime;

        if(PrayerNames[i]==='Fajr'){
          startTime = new Date(now.toDateString() + ' ' + times[PrayerNames[i]+' Start'])
          nextTime = new Date(now.toDateString() + ' ' + times['Sunrise'])
        }
        else if (PrayerNames[i]==='Sunrise'){
          startTime = new Date(now.toDateString() + ' ' + times[PrayerNames[i]])
          nextTime = new Date(now.toDateString() + ' ' + times[PrayerNames[i+1]+ ' Start'])
        }
        else if(PrayerNames[i]==='Isha'){
          currentPrayer={'Name':PrayerNames[i],'Index':i}
          break;
        }
        else{
          startTime = new Date(now.toDateString() + ' ' + times[PrayerNames[i]+' Start']);
          nextTime = new Date(now.toDateString() + ' ' + times[PrayerNames[i+1]+ ' Start']);
        }
        if (now>startTime && now<nextTime){
          currentPrayer={'Name':PrayerNames[i],'Index':i}
          break;
        }
      }
    }
    return currentPrayer
  }

  getBackgroundColours(currentPrayer){

    var prayerColours = []
    var passedCount = 0

    if (currentPrayer==='All'){
      PrayerNames.forEach(function(prayerName){
        prayerColours.push({'Name':prayerName,'Background':'darkgray','Jamat':'lightslategrey','JamatText':'Azure','MainText':'Ghostwhite'})
      })
    }
    else if(currentPrayer === 'PastSunrise'){
      for (var i=0; i<PrayerNames.length;i++){
        if (PrayerNames[i]==='Fajr' || PrayerNames[i]==='Sunrise'){
          prayerColours.push({'Name':PrayerNames[i],'Background':'dimgrey','Jamat':'grey','JamatText':'dimgrey','MainText':'grey'})
        }
        else{
          prayerColours.push({'Name':PrayerNames[i],'Background':'darkgray','Jamat':'lightslategrey','JamatText':'Azure','MainText':'Ghostwhite'})
        } 
      }
    }
    else{
      for (var i=0; i<PrayerNames.length;i++){
        if (PrayerNames[i] === currentPrayer){
          prayerColours.push({'Name':PrayerNames[i],'Background':'cadetblue','Jamat':'burlywood','JamatText':'Azure','MainText':'Ghostwhite'})
          break;
        }
        else{
          passedCount++;
        }
      }
      
      for (var i=0; i<passedCount;i++){
        prayerColours.push({'Name':PrayerNames[i],'Background':'dimgrey','Jamat':'grey','JamatText':'dimgrey','MainText':'grey'})
      }
      for (var i=passedCount+1;i<PrayerNames.length;i++){
        prayerColours.push({'Name':PrayerNames[i],'Background':'darkgray','Jamat':'lightslategrey','JamatText':'Azure','MainText':'Ghostwhite'})
      }
    }
    return prayerColours
  }
  
  getNextPrayerTime(times) {
    var now = new Date();
    var nextPrayerTime;

    for (var i = 0; i < PrayerNames.length; i++) {

      if (PrayerNames[i]==='Sunrise'){
        var sunrise = new Date(now.toDateString() + ' ' + times[PrayerNames[i]]);
        if (sunrise > now) {
          nextPrayerTime = {'Name':PrayerNames[i],'Type': 'Begins','Time':sunrise};
          break;
        }
      }
      else{
        var startTime = new Date(now.toDateString() + ' ' + times[PrayerNames[i]+' Start']);
        var jamatTime = new Date(now.toDateString() + ' ' + times[PrayerNames[i]+' Jamat']);
        
        if (startTime > now){
          nextPrayerTime = {'Name':PrayerNames[i],"Type": 'Starts','Time':startTime};
          break;
        }
        else if (jamatTime > now) {
          nextPrayerTime = {'Name':PrayerNames[i], 'Type': 'Jamat','Time':jamatTime};
          break;
        }
        if(PrayerNames[i]==='Isha'&&nextPrayerTime==undefined){

          const today = new Date()
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          var tomorrowPrayer =new Date(tomorrow.toDateString() + ' ' + this.state.tomorrowData['Fajr Start']);

          nextPrayerTime = {'Name':'Fajr','Type':'Prayer','Time':tomorrowPrayer};
        }
      }
    }
    return nextPrayerTime;
  }

  nextPrayerTimeDifference(nextPrayer){
    var now = new Date();
    var nextPrayerTime = nextPrayer.Time
    var timeDiff = nextPrayerTime - now;
    var displayTime
 
    var hours = Math.floor(timeDiff / (1000 * 60 * 60));
    if (hours<10){
      hours = '0'+hours
    }

    var minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes<10){
      minutes='0'+minutes
    }

    var seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    if (seconds<10){
      seconds='0'+seconds
    }

    if (hours>0){
      displayTime= hours + 'h ' + minutes + 'm ' + seconds +'s';
      document.getElementById('NextPrayerTimeLabel').style.fontSize="2.8vw"
      document.getElementById('NextPrayerTimeLabel').style.paddingLeft="0vw"
      document.getElementById('NextPrayerTimeLabel').style.transform="scaleY(1.09)";

    }
    else if(hours==0 && minutes == 1 && seconds == 0){
      displayTime = minutes + 'm ' + seconds+'s'
      document.getElementById('NextPrayerTimeLabel').style.fontSize="6vh"
      document.getElementById('NextPrayerTimeLabel').style.paddingLeft="1.5vw"
      document.getElementById('NextPrayerTimeLabel').style.transform="scaleY(1)";
      this.setState({currentDynamicArea:'Countdown',dynamicHoldCounter:0,switchToArabic:false,languageSwitchCouter:0})
    }
    else if(hours==0 &&minutes>=1){
      displayTime = minutes + 'm ' + seconds+'s'
      document.getElementById('NextPrayerTimeLabel').style.fontSize="6vh"
      document.getElementById('NextPrayerTimeLabel').style.paddingLeft="1.5vw"
      document.getElementById('NextPrayerTimeLabel').style.transform="scaleY(1)";
    }
    else if(seconds>=0){
      displayTime = seconds+'s';
      document.getElementById('NextPrayerTimeLabel').style.fontSize='7vh'
      document.getElementById('NextPrayerTimeLabel').style.paddingLeft="1.5vw"
      document.getElementById('NextPrayerTimeLabel').style.transform="scaleY(1)";
      this.setState({currentDynamicArea:'Countdown',dynamicHoldCounter:0,switchToArabic:false,languageSwitchCouter:0})
    }

    if(displayTime==undefined){
      displayTime='Calculating'
    }
    return displayTime
  }

  handleError(show){
    if(show){
      document.getElementById('Error').style.display='flex'
    }
    else{
    this.setState({errorMessage:this.state.buildVersion})
    }
  }

  getTomorrowData(){
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    var tomorrowData=mosqueTimes.filter( element => element.Date === getTomorrowDate())[0]
    
    return tomorrowData
  }

  handleApiError(err){
    if (this.state.lastKnownData==""){
      var todayData = mosqueTimes.filter( element => element.Date === getTodaysDate())[0]
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      var tomorrowData=this.getTomorrowData()

      this.setState({todayData:todayData,tomorrowData:tomorrowData,currentIslamicDate:"Unkown",dataStatus:"Running on Backup Data"})
    }
    else if(this.state.lastKnownData.lastRefreshed == getTodaysDate()){
      
      this.setState({todayData:this.state.lastKnownData.todayData,tomorrowData:this.state.lastKnownData.tomorrowData,currentIslamicDate:this.state.lastKnownData.hijriDate,dataStatus:"Data Failed to Refresh"})

    }
    else{
      var todayData = mosqueTimes.filter( element => element.Date === getTodaysDate())[0]
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      var tomorrowData=mosqueTimes.filter( element => element.Date === getTomorrowDate())[0]

      this.setState({todayData:todayData,tomorrowData:tomorrowData,currentIslamicDate:"Unkown",dataStatus:"Running on Backup Data"})
    }

    if(err=='Network Error'){
      this.setState({errorMessage:"Network Error"})
    }
    else if(err.includes('401')){
      this.setState({errorMessage:'401 Error'})
    }
    else if(err.includes('402')){
      this.setState({errorMessage:'402 Error'})
    }
    else if(err.includes('403')){
      this.setState({errorMessage:'403 Error'})
    }
    else if(err.includes('404')){
      this.setState({errorMessage:'404 Error'})
    }
    else{
      this.setState({errorMessage:err})
    }

    this.handleError(true)
  }

  callAPI = async () => {
    await axios.get(nodejsEndpoint,{'headers':'Access-Control-Allow-Origin:*'}).then(res=>{
    if (res.data.Status == 'Successfull'){
      this.setState({todayData:res.data.Data.todayData,tomorrowData:res.data.Data.tomorrowData,currentIslamicDate:res.data.Data.hijriDate,dataStatus:"Data Refreshed at "+getCurrentTime(false)})
      this.setState({lastKnownData:{'lastRefreshed':getTodaysDate(),'todayData':this.state.todayData,'tomorrowData':res.data.Data.tomorrowData,'hijriDate':res.data.Data.hijriDate}})
      this.handleError(false)
    }
    else{
      this.handleApiError(res.data.Data)
    }
    })
    .catch(err=>{
      this.handleApiError(err.message)
      console.log(err.message)
    })
  }

  getData(){
    var minute = getCurrentTime(false)
    minute = minute.substring(3,5)

    if (minute=="00" || minute=="30"){
      this.callAPI()
      this.setState({errorMessage:this.state.buildVersion})
    }
    else if(this.state.dataStatus=='Running on Backup Data' || this.state.dataStatus=='Data Failed to Refresh'){
      this.callAPI()
    }
  }

  getImages() {
    let images = {};
    var r = require.context('./Assets/QR Codes', false, /\.(png|jpe?g|svg)$/)
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    let codes = Object.values(images)
    this.setState({allQRCodes:codes,firstQRCode:0,QRCodes:[codes[0],codes[1],codes[2]]})
  }

  updateQRCodes(){
    var displayCodes = []

    for (var i = this.state.firstQRCode+1;i < this.state.allQRCodes.length;i++){
      if (displayCodes.length == 3){
        break;
      }
      else{
        displayCodes.push(this.state.allQRCodes[i])
      }
    }

    if(displayCodes.length<4){
      for (var i = 0; i<this.state.allQRCodes.length;i++){
        if (displayCodes.length == 3){
          break;
        }
        else{
          displayCodes.push(this.state.allQRCodes[i])
        }
      }
    }

    if (this.state.firstQRCode == this.state.allQRCodes.length-1){
      this.setState({firstQRCode:0})
    }
    else{
      this.setState({firstQRCode:this.state.firstQRCode+1})
    }
    
    this.setState({QRCodes:displayCodes})

  }

  componentDidMount(){
    // this.updatePrayerList()
    // this.syncBottomPanel()
    this.getImages()
    this.interval = setInterval(() => this.manageView(), 1000);
    this.callAPI()
    this.interval = setInterval(() => this.getData(), 30000);
  }

  render(){
      return (
        <div id="Main">
          <div id="MainView">
            <div id="MainPanel">
                <div id="Top">
                {/* <div id='MainVideo'><iframe src="https://player.vimeo.com/video/835581366?autoplay=1&loop=1&title=0&byline=0&portrait=0&muted=1&background=1" style={{top:0,left:0,display:'flex',justifyContent:'center',alignItems:'center',alignSelf:'center',width:'100%',height:'99.5%'}} frameborder="0" allow="autoplay;"></iframe></div> */}
                <div className='MainVideo'><iframe src={youtubeEmbed} frameborder="0" allow="autoplay"></iframe></div>
              </div>
              <div id="Bottom">
                <div id='Border'></div>
                <div id="BrandingArea">
                  <img id ="logo" src={logo}></img>
                  <div id="QRCodes">
                    <img className='QRCode' src={this.state.QRCodes[0]}></img>
                    <img className='QRCode' src={this.state.QRCodes[1]}></img>
                    <img className='QRCode' src={this.state.QRCodes[2]}></img>
                  </div>
                </div>
              </div>
            </div>
            <div id="SidePanel">
              <div id="PrayerList">
                <div id='Prayers'>
                  < div id='Column1' className='PrayerColumn'>
                    {this.makePrayerList('Column1')}
                  </div>
                  <div id='Column2' className='PrayerColumn'>
                    {this.makePrayerList('Column2')}
                  </div>
                </div>
                <div id="InformationPanel">
                  <div id="DateTimeArea">
                    <div id='CurrentDate'>
                      <p id="Date"></p>
                    </div>
                    <div id='CurrentTime'>
                      <p id="Time"></p>
                    </div>
                  </div>
                  <div id="NextPrayerArea">
                    <div id='NextPrayerName'>
                      <div id="NextPrayer-Name">
                        <p id="NextPrayerNameLabel"></p>
                      </div>
                    </div>
                    <div id='NextPrayerTime'>
                      <p id="NextPrayerTimeLabel"></p>
                    </div>
                  </div>
                </div>
                <div id='Alerts'>
                  <div id='Status'>{this.state.dataStatus}</div>
                  <div id='Error'>{this.state.errorMessage}</div>
                </div>
              </div>
            </div>
          </div>
          <PrayerView PrayerName={{English:this.state.nextPrayer.EnglishName,BottomText:this.state.nextPrayer.Text}} CountDown={this.state.nextPrayer.Difference} activatePrayerHold={this.state.activatePrayerHold}/>
        </div>
    );
  }
}