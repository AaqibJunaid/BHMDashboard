export function getCurrentTime(withSeconds){
    var now=new Date()
    var hours;
    var minutes;
    var seconds
    
    if(now.getHours()<10){
        hours='0'+now.getHours()
    }
    else{
        hours = now.getHours()
    }

    if(now.getMinutes()<10){
        minutes='0'+now.getMinutes()
    }
    else{
        minutes = now.getMinutes()
    }

    if(now.getSeconds()<10){
        seconds='0'+now.getSeconds()
    }
    else{
        seconds = now.getSeconds()
    }

    if(withSeconds){
        return hours+ ':' +minutes+':'+seconds
    }
    else{
        return hours+ ':' +minutes
    }
}

export function getTodaysDate() {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const formattedDate = day + '/' + month + '/' + year;
    return formattedDate;
  }

export function getTomorrowDate(){
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    var month= (tomorrow.getMonth())+1
    var date = tomorrow.getDate()

    if (month<10){
      month = '0'+month
    }

    if (date<10){
      date = '0'+date
    }

    return date+'/'+month+'/'+tomorrow.getFullYear()
}

export function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    } else {
      const lastDigit = day % 10;
      switch (lastDigit) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    }
  }

  export function getDayOfWeek(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
  }

  export function getLongDate(){
    const today = new Date();
    const day = today.getDate();
    var suffix = getDaySuffix(day);
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();

    const formattedDate = getDayOfWeek(today) + '\n ' + day + suffix + ' ' + month + ' ' + year;
    return formattedDate;
  }