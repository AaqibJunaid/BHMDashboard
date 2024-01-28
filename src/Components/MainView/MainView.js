import './MainView.css';
import React, { Component} from 'react';
import axios from 'axios';
import mosqueTimes from '../../mosqueTimes.json'
import logo from '../../Assets/Logo.jpg'
import PrayerView from '../../Components/PrayerView/PrayerView'
import { getCurrentTime, getTodaysDate,getTodaysDateWithoutYear,getTomorrowDate,getTomorrowDateWithoutYear,getLongDate,getDayOfWeek } from '../../Functions/Date Functions';
import { prayerTimesEndpoint,vimeoConfigEndpoint, mainVideoEmbed,shortVideoEmbed } from '../../Configs/urlConfigs';
import { PrayerNames,arabicPrayerNames } from '../../Configs/prayerConfigs';
import { arabicSwitchMax,qrUpdateMax,imgUpdateMax,prayerHoldTimesMax,holdVideoTimeFrames,jummahPrayerTimes,eventTimeFrames,todayPrayerDaySwitchMax,tomorrowPrayerDaySwitchMax,duaUpdateMax } from '../../Configs/timingConfigs';
import { appVersion } from '../../Configs/systemConfigs';


export default class MainView extends Component {
  constructor(props){
    super(props);
    this.state ={
      prayers:{'Fajr':'فجر','Sunrise':'شروق','Zuhur':'ظهر','Asr':'عصر','Maghrib':'مغرب','Isha':'عشاء'},
      currentDynamicArea:'Main',
      switchToArabic:false,
      languageSwitchCouter:0,
      qrUpdateTimer:0,
      imgUpdateTimer:0,
      prayerDayCounter:0,
      duaUpdateTimer:duaUpdateMax,
      todayData:mosqueTimes.filter( element => element.Date === getTodaysDateWithoutYear())[0],
      tomorrowData:mosqueTimes.filter( element => element.Date === getTomorrowDateWithoutYear())[0],
      lastKnownData:{},
      currentIslamicDate:"",
      dataStatus:"Initialising Application...",
      errorMessage:appVersion,
      buildVersion: appVersion,
      nextPrayer:{'EnglishName':'Fajr','Text':'Fajr In','Difference':'0h'},
      allQRCodes:[],
      QRCodes : [],
      firstQRCode:0,
      firstDuaImage:0,
      allContentImages:[],
      contentImage : "",
      firstContentImage:0,
      activatePrayerHold:false,
      aboutToApplyHold:false,
      holdPrayerViewCounter:0,
      holdPrayerName:'',
      holdPrayerType:'',
      elipsisCounter:0,
      mainVideo: <div id='MainVideo'><iframe src={mainVideoEmbed} style={{top:0,left:0,display:'flex',justifyContent:'center',alignItems:'center',alignSelf:'center',width:'100%',height:'99.5%'}} frameborder="0" allow="autoplay;"></iframe></div>,
      miniPrayerViewData:{'Name':'','Text':''},
      currentDay:"Todays Prayer Times",
      allDuaImages:[],
      blockArabicSwitch:true,
      mainVideoID:0,
      shortVideoID:0
    }
  }
  
  makePrayerList(columnName){
    var prayerLists1 = []
    var prayerLists2 = []
    
    PrayerNames.forEach(function(prayerName){

      var prayerItem;
      
      prayerItem = (
        <div id={prayerName} className='PrayerTime'>
          <div id={prayerName+'Body'} className='PrayerBody'>
            <div id={prayerName+'Label'} className='PrayerName'>
              {prayerName}
            </div>
            <div id={prayerName+'Start'} className='PrayerStart'>
            </div>
            <div id={prayerName+'Jamat'} className='PrayerJamat'>
              {(prayerName==='Sunrise')?'-- : --':''}
            </div>
          </div>
        </div>
      )

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
    // switch (this.state.elipsisCounter){
    //   case 0:
    //     this.setState({elipsisCounter:1})
    //     return ''
    //     break;
    //   case 1:
    //     this.setState({elipsisCounter:2})
    //     return '.'
    //     break;
    //   case 2:
    //     this.setState({elipsisCounter:3})
    //     return '..'
    //     break;
    //   case 3:
    //     this.setState({elipsisCounter:0})
    //     return '...'
    //     break;
    // }
    return '...'
  }

  calculateForbiddenTimes(){
    var forbiddenPeriods=[]
    var todayTimes = this.state.todayData
    const now = new Date()

    var sunriseTime = new Date(now.toDateString() + ' ' + (todayTimes['Sunrise']))
    var sunriseStartTime = new Date(sunriseTime.getTime())
    var sunriseEndTime = new Date(sunriseTime.getTime()+20*60000)
    forbiddenPeriods.push({'MainTitle':'Attention','BottomTitle':'Please Refrain from Praying for ','ViewType':'Countdown','StartTime':sunriseStartTime.toLocaleTimeString(),'EndTime':sunriseEndTime.toLocaleTimeString()})

    var zuhurTime = new Date(now.toDateString() + ' ' + (todayTimes['Zuhur Start']))
    var zuhurStartTime = new Date(zuhurTime.getTime()-5*60000)
    var zuhurEndTime = new Date(zuhurTime.getTime())
    forbiddenPeriods.push({'MainTitle':'Attention','BottomTitle':'Please Refrain from Praying for ','ViewType':'Countdown','StartTime':zuhurStartTime.toLocaleTimeString(),'EndTime':zuhurEndTime.toLocaleTimeString()})

    return forbiddenPeriods
  }

  calculatePrayerViewTimings(){
    var prayerViewTimes=[]
    var todayTimes = this.state.todayData
    const now = new Date()

    PrayerNames.forEach((prayer)=>{
      if (prayer=='Zuhur' && getDayOfWeek(now)=='Friday'){
        for (var i=0;i<jummahPrayerTimes.length;i++){
          var jamatTime = new Date(now.toDateString() + ' ' + (jummahPrayerTimes[i]))
          var jummahStartTime = new Date(jamatTime.getTime()-1*60000)
          var jumaahStartEndTime = new Date(jamatTime.getTime())
          var jummahKhutbahStartTime = new Date(jamatTime.getTime()-1000)
          var jumaahKhutbahEndTime = new Date(jamatTime.getTime()+20*60000)
          var jummahJamatStartTime = new Date(jamatTime.getTime()+(20*60000)-1000)
          var jumaahJamatEndTime = new Date(jamatTime.getTime()+30*60000)
          var jummahNumber = ([i]+1==1)?'1st':'2nd'
          prayerViewTimes.push({'MainTitle':jummahNumber+' Jummah','BottomTitle':'Starts in','ViewType':'Countdown','StartTime':jummahStartTime.toLocaleTimeString(),'EndTime':jumaahStartEndTime.toLocaleTimeString()})
          prayerViewTimes.push({'MainTitle':jummahNumber+' Jummah','BottomTitle':'Khutbah in Progress','ViewType':'Static','StartTime':jummahKhutbahStartTime.toLocaleTimeString(),'EndTime':jumaahKhutbahEndTime.toLocaleTimeString()})
          prayerViewTimes.push({'MainTitle':jummahNumber+' Jummah','BottomTitle':'Jamat in Progress','ViewType':'Static','StartTime':jummahJamatStartTime.toLocaleTimeString(),'EndTime':jumaahJamatEndTime.toLocaleTimeString()})
        }

      }
      else if(prayer == 'Sunrise'){
        var prayerTime = new Date(now.toDateString() + ' ' + (todayTimes['Sunrise']))
        var StartTime = new Date(prayerTime.getTime()-1*60000)
        var EndTime = new Date(prayerTime.getTime())
        prayerViewTimes.push({'MainTitle':'Sunrise','BottomTitle':'Starts in','ViewType':'Countdown','StartTime':StartTime.toLocaleTimeString(),'EndTime':EndTime.toLocaleTimeString()})
      }
      else if(prayer == 'Maghrib'){
        var prayerMaxHold = prayerHoldTimesMax['MaghribJamat']
        var prayerTime = new Date(now.toDateString() + ' ' + (todayTimes[prayer+' Start']))
        var prayerStartTime = new Date(prayerTime.getTime()-1*60000)
        var prayerEndTime = new Date(prayerTime.getTime())
        var jamatStartTime = new Date(prayerTime.getTime()-1000)
        var jamatEndTime = new Date(prayerTime.getTime()+prayerMaxHold*60000)

        prayerViewTimes.push({'MainTitle':'Maghrib','BottomTitle':'Starts in','ViewType':'Countdown','StartTime':prayerStartTime.toLocaleTimeString(),'EndTime':prayerEndTime.toLocaleTimeString()})
        prayerViewTimes.push({'MainTitle':'Maghrib','BottomTitle':'Jamat in Progress','ViewType':'Static','StartTime':jamatStartTime.toLocaleTimeString(),'EndTime':jamatEndTime.toLocaleTimeString()})

      }
      else {
        var prayerMaxHold = prayerHoldTimesMax[prayer+'Starts']
        var jamatMaxHold = prayerHoldTimesMax[prayer+'Jamat']

        var prayerTime = new Date(now.toDateString() + ' ' + (todayTimes[prayer+' Start']))
        var jamatTime = new Date(now.toDateString() + ' ' + (todayTimes[prayer+' Jamat']))

        var prayerStartTime = new Date(prayerTime.getTime()-1*60000)
        var prayerEndTime = new Date(prayerTime.getTime())
        var prayerHoldStartTime = new Date(prayerTime.getTime()-1000)
        var prayerHoldEndTime = new Date(prayerTime.getTime()+prayerMaxHold*60000)

        var jamatStartTime = new Date(jamatTime.getTime()-1*60000)
        var jamatEndTime = new Date(jamatTime.getTime())
        var jamatHoldStartTime = new Date(jamatTime.getTime()-1000)
        var jamatHoldEndTime = new Date(jamatTime.getTime()+jamatMaxHold*60000)


        prayerViewTimes.push({'MainTitle':prayer,'BottomTitle':'Starts in','ViewType':'Countdown','StartTime':prayerStartTime.toLocaleTimeString(),'EndTime':prayerEndTime.toLocaleTimeString()})
        prayerViewTimes.push({'MainTitle':prayer,'BottomTitle':'Now Started','ViewType':'Static','StartTime':prayerHoldStartTime.toLocaleTimeString(),'EndTime':prayerHoldEndTime.toLocaleTimeString()})
        prayerViewTimes.push({'MainTitle':prayer,'BottomTitle':'Jamat in','ViewType':'Countdown','StartTime':jamatStartTime.toLocaleTimeString(),'EndTime':jamatEndTime.toLocaleTimeString()})
        prayerViewTimes.push({'MainTitle':prayer,'BottomTitle':'Jamat in Progress','ViewType':'Static','StartTime':jamatHoldStartTime.toLocaleTimeString(),'EndTime':jamatHoldEndTime.toLocaleTimeString()})
      }
    })

    eventTimeFrames.forEach((event)=>{
      if (event.Date == getTodaysDate()){
        prayerViewTimes.push({'MainTitle':event.MainTitle,'BottomTitle':event.BottomTitle,'ViewType':'Static','StartTime':event.StartTime,'EndTime':event.EndTime})
      }
    })
    return prayerViewTimes
  }

  manageView(){
    if(this.state.dataStatus!=="Initialising Application..."){
      this.updatePrayerList()
      var prayerViewTimings = this.calculatePrayerViewTimings()
      var forbiddenPeriods = this.calculateForbiddenTimes()
      var matchFound = false
      var forbiddenPeriodFound = false
      const now = new Date()
      var holdScreen = false

      for (var i=0;i<forbiddenPeriods.length;i++){
        if(now.toLocaleTimeString()>= forbiddenPeriods[i].StartTime && now.toLocaleTimeString()< forbiddenPeriods[i].EndTime ){
          forbiddenPeriodFound=true
          var prayerTime = new Date(now.toDateString() + ' ' + forbiddenPeriods[i].EndTime)
          var prayer = {'Name':forbiddenPeriods[i].MainTitle,"Type": 'Starts','Time':prayerTime}
          var timeDiff = this.nextPrayerTimeDifference(prayer)
          this.setState({nextPrayer:{'EnglishName':forbiddenPeriods[i].MainTitle,'Text':forbiddenPeriods[i].BottomTitle+this.handleProgress(),'Difference':timeDiff},activatePrayerHold:false})
          this.setState({miniPrayerViewData:{'Name':forbiddenPeriods[i].MainTitle,'Text':forbiddenPeriods[i].BottomTitle +timeDiff}})
          break;
        }
      }

      if (!forbiddenPeriodFound || forbiddenPeriodFound && this.props.MosqueArea !== "Main Hall"){
        for (var i=0;i<prayerViewTimings.length;i++){
          if(now.toLocaleTimeString()>= prayerViewTimings[i].StartTime && now.toLocaleTimeString()< prayerViewTimings[i].EndTime ){
            matchFound=true
  
            if(prayerViewTimings[i].ViewType=='Static'){
              this.setState({nextPrayer:{'EnglishName':prayerViewTimings[i].MainTitle,'Text':prayerViewTimings[i].BottomTitle,'Difference':getCurrentTime()},activatePrayerHold:true})
              this.setState({miniPrayerViewData:{'Name':prayerViewTimings[i].MainTitle,'Text':prayerViewTimings[i].BottomTitle}})
              holdScreen=true
            }
            else{
              var prayerTime = new Date(now.toDateString() + ' ' + prayerViewTimings[i].EndTime)
              var prayer = {'Name':prayerViewTimings[i].MainTitle,"Type": 'Starts','Time':prayerTime}
              var timeDiff = this.nextPrayerTimeDifference(prayer)
              this.setState({nextPrayer:{'EnglishName':prayerViewTimings[i].MainTitle,'Text':prayerViewTimings[i].BottomTitle+this.handleProgress(),'Difference':timeDiff},activatePrayerHold:false})
              this.setState({miniPrayerViewData:{'Name':prayerViewTimings[i].MainTitle,'Text':prayerViewTimings[i].BottomTitle}})
            }
            break;
          }
        }
      }

      if (forbiddenPeriodFound && this.props.MosqueArea == 'Main Hall'){
        document.getElementById('MainView').style.display='flex'
        document.getElementById('MiniPrayerView').style.display='flex'
        document.getElementById('PrayerViewContainer').style.display='none'
        document.getElementById('PrayerView').style.display='none'
        document.getElementById('MainVideo').style.display='none'
        document.getElementById('ImageContent').style.display='none'

        this.updatePrayerList()
        this.syncBottomPanel()
        this.setState({elipsisCounter:0})

        if(this.state.qrUpdateTimer==qrUpdateMax){
          this.updateQRCodes()
          this.setState({qrUpdateTimer:0})
        }
        else{
          this.setState({qrUpdateTimer:this.state.qrUpdateTimer+1})
        }

        if(this.state.imgUpdateTimer==imgUpdateMax){
          this.updateContent()
          this.setState({imgUpdateTimer:0})
        }
        else{
          this.setState({imgUpdateTimer:this.state.imgUpdateTimer+1})
        }
      }
      else if(matchFound){
        if(this.props.MosqueArea == 'Main Hall'){
          document.getElementById('MainView').style.display='none'
          document.getElementById('PrayerViewContainer').style.display='flex'
          document.getElementById('PrayerView').style.display='flex'
          document.getElementById('MiniPrayerView').style.display='none'
          document.getElementById('MainVideo').style.display='none'
          document.getElementById('ImageContent').style.display='none'
          this.updateLanguage()
        }
        else{
          if(holdScreen==false){
            document.getElementById('MainView').style.display='none'
            document.getElementById('MiniPrayerView').style.display='none'
            document.getElementById('PrayerViewContainer').style.display='flex'
            document.getElementById('PrayerView').style.display='flex'
            document.getElementById('MainVideo').style.display='none'
            document.getElementById('ImageContent').style.display='none'
          }
          else{
            document.getElementById('MainView').style.display='flex'
            document.getElementById('MiniPrayerView').style.display='flex'
            document.getElementById('PrayerViewContainer').style.display='none'
            document.getElementById('PrayerView').style.display='none'
            document.getElementById('MainVideo').style.display='none'
            document.getElementById('ImageContent').style.display='none'

            this.updatePrayerList()
            this.syncBottomPanel()
            this.setState({elipsisCounter:0})

            if(this.state.qrUpdateTimer==qrUpdateMax){
              this.updateQRCodes()
              this.setState({qrUpdateTimer:0})
            }
            else{
              this.setState({qrUpdateTimer:this.state.qrUpdateTimer+1})
            }

            if(this.state.imgUpdateTimer==imgUpdateMax){
              this.updateContent()
              this.setState({imgUpdateTimer:0})
            }
            else{
              this.setState({imgUpdateTimer:this.state.imgUpdateTimer+1})
            }

          }
        }
      }
      else{
        document.getElementById('MainView').style.display='flex'
        document.getElementById('PrayerViewContainer').style.display='none'
        document.getElementById('MiniPrayerView').style.display='none'
        document.getElementById('PrayerView').style.display='none'

        if(this.props.MosqueArea == 'Main Hall'){
          document.getElementById('MainVideo').style.display='none'
          this.handleMediaPics()
          document.getElementById('ImageContent').style.display='flex'
        }
        else{
          this.handleVideo()
          document.getElementById('MainVideo').style.display='flex'
          document.getElementById('ImageContent').style.display='none'
        }
        
        this.updatePrayerList()
        this.syncBottomPanel()

        this.setState({elipsisCounter:0})

        if(this.state.qrUpdateTimer==qrUpdateMax){
          this.updateQRCodes()
          this.setState({qrUpdateTimer:0})
        }
        else{
          this.setState({qrUpdateTimer:this.state.qrUpdateTimer+1})
        }
      }
    }
  }

  handleMediaPics(){
    var todayHolds = []
    var todayTimes = this.state.todayData
    const now = new Date()

    PrayerNames.forEach((prayer)=>{
      if(prayer !== 'Sunrise'){
        var jamatTime = new Date(now.toDateString() + ' ' + (todayTimes[prayer+' Jamat']))
        var StartTime = new Date(jamatTime.getTime()+prayerHoldTimesMax[prayer+'Jamat']*60000)
        var EndTime = new Date(jamatTime.getTime()+((Number(prayerHoldTimesMax[prayer+'Jamat'])+8)*60000))
        todayHolds.push({StartTime:StartTime.toLocaleTimeString(),'EndTime':EndTime.toLocaleTimeString()})
      }
    })

    var switchToDua = false

    for (var i = 0;i<todayHolds.length;i++){
      if(now.toLocaleTimeString()>= todayHolds[i].StartTime && now.toLocaleTimeString()<= todayHolds[i].EndTime){
        switchToDua=true
        break;
      }
    }

    if (switchToDua){
      if (this.state.duaUpdateTimer==duaUpdateMax){
        this.updateDua()
        this.setState({duaUpdateTimer:0,firstContentImage:0})
      }
      else{
        this.setState({duaUpdateTimer:this.state.duaUpdateTimer+1,firstContentImage:0})
      }
    }
    else{
      if(this.state.imgUpdateTimer==imgUpdateMax){
        this.updateContent()
        this.setState({imgUpdateTimer:0,firstDuaImage:0})
      }
      else{
        this.setState({imgUpdateTimer:this.state.imgUpdateTimer+1,firstDuaImage:0})
      }
    }
  }

  updateNextPrayer(nextPrayer){
    var nextPrayerName = nextPrayer.Name
    var nextPrayerType = nextPrayer.Type
    var now = new Date()
    var displayTime = this.nextPrayerTimeDifference(nextPrayer)

    this.setState({nextPrayer:{'EnglishName':nextPrayerName,'ArabicName':this.state.prayers[nextPrayerName],'PrayerType':nextPrayerType,'Difference':displayTime}})

    if(this.state.switchToArabic && this.state.blockArabicSwitch==false){
      var arabicName;

      for (var i=0;i<PrayerNames.length;i++){
        if (PrayerNames[i]===nextPrayerName){
          if (nextPrayerName=='Zuhur' && getDayOfWeek(now)=='Friday'){
            arabicName = 'جمعة'
          }
          else{
            arabicName = arabicPrayerNames[i]
          }
          break;
        }
      }  
      document.getElementById('NextPrayerNameLabel').style.paddingTop= '0%'
      document.getElementById('NextPrayerNameLabel').style.paddingLeft= '11%' 
      document.getElementById('NextPrayerNameLabel').style.justifyContent= 'unset' 
      document.getElementById('NextPrayerNameLabel').innerText= arabicName +'\n'+nextPrayerType +' in ...'
      document.getElementById('NextPrayerNameLabel').style.fontSize= '1.95vw' 
    }
    else{
      if (nextPrayerName=='Zuhur' && getDayOfWeek(now)=='Friday'){
        nextPrayerName = 'Jummah'
      }
      document.getElementById('NextPrayerNameLabel').innerText= nextPrayerName  +'\n'+nextPrayerType +' in ...' 
      document.getElementById('NextPrayerNameLabel').style.paddingTop= '2%' 
      document.getElementById('NextPrayerNameLabel').style.paddingLeft= '12.5%' 
      document.getElementById('NextPrayerNameLabel').style.justifyContent= 'unset' 
      document.getElementById('NextPrayerNameLabel').style.fontSize= '2vw' 
    }
    document.getElementById('NextPrayerTimeLabel').innerText=displayTime
  }

  updatePrayerList(){
    var timingsToDisplay = ""
    if(this.state.currentDay=="Todays Prayer Times"){
      if(this.state.prayerDayCounter<todayPrayerDaySwitchMax){
        timingsToDisplay = "Today"
        this.setState({prayerDayCounter:this.state.prayerDayCounter+1})
      }
      else{
        timingsToDisplay = "Tomorrow"
        this.setState({currentDay:"Tomorrows Prayer Times",prayerDayCounter:0})
      }
    }
    else{
      if(this.state.prayerDayCounter<tomorrowPrayerDaySwitchMax){
        timingsToDisplay = "Tomorrow"
        this.setState({prayerDayCounter:this.state.prayerDayCounter+1})
      }
      else{
        timingsToDisplay = "Today"
        this.setState({currentDay:"Todays Prayer Times",prayerDayCounter:0})
      }
    }

    var timings = []
    var now = new Date()

    if(timingsToDisplay=='Today'){
      timings=this.state.todayData
      if (getDayOfWeek(now)=='Friday'){
        if (now.toLocaleTimeString()>=jummahPrayerTimes[0]){
          timings['Zuhur Jamat']=jummahPrayerTimes[1]
        }
        else{
          timings['Zuhur Jamat']=jummahPrayerTimes[0]
        }
        this.setState({todayData:timings})
      }
      var currentPrayer=this.getCurrentPrayer(timings)

      var backgroundColours=this.getBackgroundColours(currentPrayer.Name)
      backgroundColours.forEach(function(prayer){
      
        if (getDayOfWeek(now)=='Friday' && prayer.Name =='Zuhur'){
          document.getElementById('ZuhurLabel').innerText='Jummah'
        }
        else{
          document.getElementById(prayer.Name+'Label').innerText=prayer.Name
        }
        
        document.getElementById(prayer.Name).style.backgroundColor=prayer.Background
        document.getElementById(prayer.Name+'Jamat').style.backgroundColor=prayer.Jamat
        document.getElementById(prayer.Name+'Label').style.color=prayer.MainText
        document.getElementById(prayer.Name+'Start').style.color=prayer.MainText
        document.getElementById(prayer.Name+'Jamat').style.color=prayer.JamatText
      })
    }
    else{
      timings=this.state.tomorrowData
      if (getDayOfWeek(now)=='Thursday'){
        if (now.toLocaleTimeString()>=jummahPrayerTimes[0]){
          timings['Zuhur Jamat']=jummahPrayerTimes[1]
        }
        else{
          timings['Zuhur Jamat']=jummahPrayerTimes[0]
        }
      }
      this.setState({tomorrowData:timings})

      var backgroundColours=this.getBackgroundColours("All")
      backgroundColours.forEach(function(prayer){

        if (getDayOfWeek(now)=='Thursday' && prayer.Name =='Zuhur'){
          document.getElementById('ZuhurLabel').innerText='Jummah'
        }
        else{
          document.getElementById(prayer.Name+'Label').innerText=prayer.Name
        }
      
        document.getElementById(prayer.Name).style.backgroundColor=prayer.Background
        document.getElementById(prayer.Name+'Jamat').style.backgroundColor=prayer.Jamat
        document.getElementById(prayer.Name+'Label').style.color=prayer.MainText
        document.getElementById(prayer.Name+'Start').style.color=prayer.MainText
        document.getElementById(prayer.Name+'Jamat').style.color=prayer.JamatText
      })
    }
    
    PrayerNames.forEach(function(prayerName) {
      if (prayerName ==='Sunrise'){
        document.getElementById('SunriseStart').innerText=(timings[prayerName]).substring(0,5)
      }
      else{
        // document.getElementById(prayerName+'Start').innerText=(timings[prayerName+' Start']).substring(0,5)
        // document.getElementById(prayerName+'Jamat').innerText=(timings[prayerName+' Jamat']).substring(0,5)
        document.getElementById(prayerName+'Start').innerText=(timings[prayerName+' Jamat']).substring(0,5)
        document.getElementById(prayerName+'Jamat').innerText=(timings[prayerName+' Start']).substring(0,5)
      }
    })
  }

  updateLanguage(){
    var now = new Date()
    if (this.state.switchToArabic === true){
      if(this.state.blockArabicSwitch == false){
        for (var i=0;i<PrayerNames.length;i++){
          if(this.state.currentDay=="Todays Prayer Times"){
            if (getDayOfWeek(now)=='Friday' && PrayerNames[i]=='Zuhur'){
              document.getElementById('ZuhurLabel').innerText='جمعة'
            }
            else{
              document.getElementById(PrayerNames[i]+'Label').innerText=arabicPrayerNames[i]
            }
          }
          else{
            if (getDayOfWeek(now)=='Thursday'&& PrayerNames[i]=='Zuhur'){
              document.getElementById('ZuhurLabel').innerText='جمعة'
            }
            else{
              document.getElementById(PrayerNames[i]+'Label').innerText=arabicPrayerNames[i]
            }
          }
        }
      }      
      if(this.state.currentIslamicDate=="Unkown" ||this.state.currentIslamicDate==""){
        document.getElementById('Date').innerText=getLongDate()
        document.getElementById('Date').style.fontSize='2vw'
        document.getElementById('Date').style.paddingLeft='3%'
        document.getElementById('Date').style.transform="scaleY(1)"
      }
      else{
        document.getElementById('Date').innerText=this.state.currentIslamicDate
        if(this.state.currentIslamicDate.includes("ath-Th")){
          document.getElementById('Date').style.fontSize='1.56vw'
        }
        else{
          document.getElementById('Date').style.fontSize='1.95vw'
        }
        document.getElementById('Date').style.transform="scaleY(1)"
        document.getElementById('Date').style.paddingLeft='3%'
      }
    }
    else{
      var day = this.state.currentDay

      PrayerNames.forEach(function (prayer){
        if(day=="Todays Prayer Times"){
          if (getDayOfWeek(now)=='Friday' && prayer =='Zuhur'){
            document.getElementById('ZuhurLabel').innerText='Jummah'
          }
          else{
            document.getElementById(prayer+'Label').innerText=prayer
          }
        }
        else{
          if (getDayOfWeek(now)=='Thursday' && prayer =='Zuhur'){
            document.getElementById('ZuhurLabel').innerText='Jummah'
          }
          else{
            document.getElementById(prayer+'Label').innerText=prayer
          }
        }
      })

      document.getElementById('Date').innerText=getLongDate()
      document.getElementById('Date').style.fontSize='1.9vw'
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
    document.getElementById('DateTimeArea').style.display='flex'
    // document.getElementById('Time').innerText=getCurrentTime(true)
    document.getElementById('Time').innerText=getCurrentTime(false)
    document.getElementById('NextPrayerArea').style.display='flex'
    this.updateNextPrayer(this.getNextPrayerTime(todayTimes))
    this.nextPrayerTimeDifference(this.getNextPrayerTime(todayTimes))
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
      document.getElementById('NextPrayerTimeLabel').style.fontSize="3.5vw"
      document.getElementById('NextPrayerTimeLabel').style.paddingLeft="1.5vw"
      document.getElementById('NextPrayerTimeLabel').style.transform="scaleY(1)";
      this.setState({currentDynamicArea:'Countdown',dynamicHoldCounter:0,switchToArabic:false,languageSwitchCouter:0})
    }
    else if(hours==0 &&minutes>=1){
      displayTime = minutes + 'm ' + seconds+'s'
      document.getElementById('NextPrayerTimeLabel').style.fontSize="3.5vw"
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

  handleApiError(err){
    if (this.state.lastKnownData==""){
      var todayData = mosqueTimes.filter( element => element.Date === getTodaysDateWithoutYear())[0]
      var tomorrowData=mosqueTimes.filter( element => element.Date === getTomorrowDateWithoutYear())[0]
      this.setState({todayData:todayData,tomorrowData:tomorrowData,currentIslamicDate:"Unkown",dataStatus:"Running on Backup Data"})
    }
    else if(this.state.lastKnownData.lastRefreshed == getTodaysDate()){
      this.setState({todayData:this.state.lastKnownData.todayData,tomorrowData:this.state.lastKnownData.tomorrowData,currentIslamicDate:this.state.lastKnownData.hijriDate,dataStatus:"Data Failed to Refresh"})
    }
    else{
      var todayData = mosqueTimes.filter( element => element.Date === getTodaysDateWithoutYear())[0]
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      var tomorrowData=mosqueTimes.filter( element => element.Date === getTomorrowDateWithoutYear())[0]

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
  }

  callAPI = async () => {
    try{

      const prayerTimesResponse = await fetch(prayerTimesEndpoint)
      const prayerTimesResult = await prayerTimesResponse.json()
      if (prayerTimesResult.Status == 'Successfull'){
        this.setState({todayData:prayerTimesResult.Data.todayData,tomorrowData:prayerTimesResult.Data.tomorrowData,currentIslamicDate:prayerTimesResult.Data.hijriDate,dataStatus:"Data Refreshed at "+getCurrentTime(false)})
        this.setState({lastKnownData:{'lastRefreshed':getTodaysDate(),'todayData':this.state.todayData,'tomorrowData':prayerTimesResult.Data.tomorrowData,'hijriDate':prayerTimesResult.Data.hijriDate}})
        this.setState({errorMessage:this.state.buildVersion})
      }
      else{
        this.handleApiError(prayerTimesResult.Data)
      }

      const vimeoIDResponse = await fetch(vimeoConfigEndpoint)
      const vimeoIDResult = await vimeoIDResponse.json()

      this.setState({mainVideoID:vimeoIDResult.Data[0].MainID,shortVideoID:vimeoIDResult.Data[0].ShortID})
      this.handleVideo()
      this.setState({dataStatus:"Data Refreshed at "+getCurrentTime(false)})
    }
    catch (error){
      this.handleApiError(error.message)
      console.log(error.message)
    }
  }

  getData(){
    const now = new Date()
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

  getQRImages() {
    let images = {};
    var r = require.context('../../Assets/QR Codes', false, /\.(png|jpe?g|svg)$/)
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    let codes = Object.values(images)
    this.setState({allQRCodes:codes,firstQRCode:0,QRCodes:[codes[0],codes[1],codes[2]]})
  }

  shuffleArray(array) {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  getContent() {
    let images = {};
    let cfImages = {};
    let today = new Date()
    let dow = getDayOfWeek(today)
    let allImages = []
    
    switch (dow) {
      case "Sunday":
        var r = require.context('../../Assets/Content/Sunday', false, /\.(png|jpe?g|svg)$/)
        break;
      case "Monday":
        var r = require.context('../../Assets/Content/Monday', false, /\.(png|jpe?g|svg)$/)
        break;
      case "Tuesday":
        var r = require.context('../../Assets/Content/Tuesday', false, /\.(png|jpe?g|svg)$/)
        break;
      case "Wednesday":
        var r = require.context('../../Assets/Content/Wednesday', false, /\.(png|jpe?g|svg)$/)
        break;
      case "Thursday":
        var r = require.context('../../Assets/Content/Thursday', false, /\.(png|jpe?g|svg)$/)
        break;
      case "Friday":
        var r = require.context('../../Assets/Content/Friday', false, /\.(png|jpe?g|svg)$/)
        break;
      case "Saturday":
        var r = require.context('../../Assets/Content/Saturday', false, /\.(png|jpe?g|svg)$/)
        break;
    }

    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    let imgs = Object.values(images)

    var cf = require.context('../../Assets/Content/Common', false, /\.(png|jpe?g|svg)$/)
    cf.keys().map((item, index) => { cfImages[item.replace('./', '')] = cf(item); });

    let imgsCommon = Object.values(cfImages)

    allImages = imgs
    allImages.push(...imgsCommon)
    allImages = this.shuffleArray(allImages)

    let duaImages = {};
    var duaFolder = require.context('../../Assets/Content/Dua', false, /\.(png|jpe?g|svg)$/)
    duaFolder.keys().map((item, index) => { duaImages[item.replace('./', '')] = duaFolder(item); });
    let duas = Object.values(duaImages)

    this.setState({allContentImages:allImages,duaImages:duas,firstContentImage:0,contentImage:allImages[0]})

  }

  updateQRCodes(){
    var displayCodes = []
    if (this.state.allQRCodes.length>3){
      for (var i = this.state.firstQRCode+1;i < this.state.allQRCodes.length;i++){
        if (displayCodes.length == this.state.allQRCodes.length-1){
          break;
        }
        else{
          displayCodes.push(this.state.allQRCodes[i])
        }
      }

      if(displayCodes.length<this.state.allQRCodes.length){
        for (var i = 0; i<this.state.allQRCodes.length;i++){
          if (displayCodes.length == this.state.allQRCodes.length){
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
    }
    else{
      displayCodes=this.state.allQRCodes
    }
    
    this.setState({QRCodes:displayCodes})
  }

  updateContent(){
    if(this.state.firstContentImage == this.state.allContentImages.length){
      this.setState({firstContentImage:0,contentImage:this.state.allContentImages[0]})
    }
    else{
      var current = this.state.allContentImages[this.state.firstContentImage]
      var counter = this.state.firstContentImage + 1
      this.setState({firstContentImage:counter,contentImage:current})
    }
  }

  updateDua(){
    let currentPrayer = this.getCurrentPrayer(this.state.todayData).Name
    let fajrSlides = []
    let otherSlides = []

    for (let i=0;i<this.state.duaImages.length;i++){
      if (this.state.duaImages[i].includes('Fajr')){
        fajrSlides.push(this.state.duaImages[i])
      }
      else{
        otherSlides.push(this.state.duaImages[i])
      }
    }

    if(currentPrayer=='Fajr'){
      this.setState({firstDuaImage:0,contentImage:fajrSlides[0]})
    }
    else{
      if(this.state.firstDuaImage == otherSlides.length){
        this.setState({firstDuaImage:0,contentImage:otherSlides[0]})
      }
      else{
        var current = otherSlides[this.state.firstDuaImage]
        var nextCounter = this.state.firstDuaImage + 1
        this.setState({firstDuaImage:nextCounter,contentImage:current})
      }
    }
  }

  handleVideo(){
    var todayHolds = []
    var todayTimes = this.state.todayData
    const now = new Date()

    PrayerNames.forEach((prayer)=>{
      if (prayer=='Zuhur' && getDayOfWeek(now)=='Friday'){
        todayHolds.push({StartTime:'12:00:00',EndTime:'15:00:00'})
      }
      else if(prayer !== 'Sunrise'){
        var jamatTime = new Date(now.toDateString() + ' ' + (todayTimes[prayer+' Jamat']))
        var StartTime = new Date(jamatTime.getTime()-15*60000)
        var EndTime = new Date(jamatTime.getTime()+15*60000)
        todayHolds.push({StartTime:StartTime.toLocaleTimeString(),'EndTime':EndTime.toLocaleTimeString()})
      }
    })

    holdVideoTimeFrames.forEach((timeFrame)=>{
      if (timeFrame.Date == getTodaysDate()){
        todayHolds.push({StartTime:timeFrame.StartTime,EndTime:timeFrame.EndTime})
      }
    })

    var switchToMiniVideo = false

    for (var i = 0;i<todayHolds.length;i++){
      if(now.toLocaleTimeString()>= todayHolds[i].StartTime && now.toLocaleTimeString()<= todayHolds[i].EndTime ){
        switchToMiniVideo=true
        break;
      }
    }

    if (switchToMiniVideo){
      var shortURL = shortVideoEmbed.replace("[shortVideoID]",this.state.shortVideoID)
      this.setState({mainVideo:<div id='MainVideo'><iframe src={shortURL} style={{top:0,left:0,display:'flex',justifyContent:'center',alignItems:'center',alignSelf:'center',width:'100%',height:'99.5%'}} frameborder="0" allow="autoplay;"></iframe></div>})
    }
    else{
      var mainURL = mainVideoEmbed.replace("[mainVideoID]",this.state.mainVideoID)
      this.setState({mainVideo:<div id='MainVideo'><iframe src={mainURL} style={{top:0,left:0,display:'flex',justifyContent:'center',alignItems:'center',alignSelf:'center',width:'100%',height:'99.5%'}} frameborder="0" allow="autoplay;"></iframe></div>})
    }
  }

  initaliseView(){
    this.callAPI()
    this.getQRImages()
    this.getContent()
    this.calculatePrayerViewTimings()
    this.manageView()
  }

  componentDidMount(){
    this.initaliseView()
    this.interval = setInterval(() => this.manageView(), 1000);
    this.interval = setInterval(() => this.getData(), 30000);
  }

  render(){
      return (
        <div>
        {(this.state.dataStatus=="Initialising Application...")?
        (<div id='LoadScreen'>
          <div class="custom-loader"></div>
        </div>)
        :
        (<div>
            <div id="MainView">
            <div id="MainPanel">
                <div id="Top">
                {this.state.mainVideo}
                <div id='MiniPrayerView'>
                    <div id='MiniPrayer-Name'>{this.state.miniPrayerViewData.Name}</div>
                    <div id='MiniPrayer-Type'>{this.state.miniPrayerViewData.Text}</div>
                </div>
                <div id='ImageContent'>
                  <img className='img' src={this.state.contentImage}></img>
                </div>

                {/* <div className='MainVideo'><iframe src={youtubeEmbed} frameborder="0" allow="autoplay"></iframe></div> */}
                {/* <div id='MainVideo'><iframe src={youtubeEmbed} style={{top:0,left:0,display:'flex',justifyContent:'center',alignItems:'center',alignSelf:'center',width:'100%',height:'100%',pointerEvents:'none'}} frameborder="0" allow="autoplay"></iframe></div> */}
              </div>
              <div id="Bottom">
                <div id='BorderWhite'></div>
                <div id='BorderPadding'></div>
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
                <div id="DayPrayer">{this.state.currentDay}</div>
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
          <div id='PrayerViewContainer'>
            <PrayerView PrayerName={{English:this.state.nextPrayer.EnglishName,BottomText:this.state.nextPrayer.Text}} CountDown={this.state.nextPrayer.Difference} activatePrayerHold={this.state.activatePrayerHold} hijriDateFlag={this.state.switchToArabic} hijriDate={this.state.currentIslamicDate}/>
          </div>
        </div>)
        }
        </div>
    );
  }
}