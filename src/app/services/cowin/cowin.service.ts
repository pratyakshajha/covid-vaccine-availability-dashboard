import { Center, Session, TableData } from "../constants/models";

export class CowinService {
  lastUpdated: Date;
  BASE_URL: string = "https://cdn-api.co-vin.in/api";
  STATES_URL: string = "/v2/admin/location/states";
  // append {state_id}
  DISTRICTS_URL: string = "/v2/admin/location/districts";
  // append pincode=123456&date=31-03-2021
  PINCODE_URL: string = "/v2/appointment/sessions/public/findByPin";
  WEEK_PINCODE_URL: string = "/v2/appointment/sessions/public/calendarByPin";
  // append district_id=123456&date=31-03-2021
  DISTRICT_URL: string = "/v2/appointment/sessions/public/findByDistrict";
  WEEK_DISTRICT_URL: string = "/v2/appointment/sessions/public/calendarByDistrict";

  pincode: string = "440010";
  districtId: string = "365";
  today: Date = new Date(Date.now());
  searchDate: string = this.getDateString(new Date(this.today.setDate(this.today.getDate() + 1)));

  request:XMLHttpRequest = new XMLHttpRequest();  
  
  constructor() { }

  getSessionNextWeekByDateAndDistrict(): TableData[] {    
    let centers:Center[] = [];
    let qParams =  "?district_id=" + this.districtId + "&date=" + this.searchDate;
    this.request.open('GET', this.BASE_URL + this.WEEK_DISTRICT_URL + qParams, false);
    this.request.onload = function () {       
      if (this.status >= 200 && this.status < 400) {        
        centers = <Center[]>JSON.parse(this.response)['centers'];        
      }
     }     
    this.request.send();
    this.lastUpdated = new Date(Date.now());
    return this.getTableDataFromCenterResponseData(centers);
    
  }

  getSessionNextWeekByDateAndPincode(): TableData[] {    
    let centers:Center[] = [];
    let qParams =  "?pincode=" + this.pincode + "&date=" + this.searchDate;
    this.request.open('GET', this.BASE_URL + this.WEEK_PINCODE_URL + qParams, false);
    this.request.onload = function () {       
      if (this.status >= 200 && this.status < 400) {
        centers = <Center[]>JSON.parse(this.response)['centers'];        
      }
     }     
    this.request.send();
    this.lastUpdated = new Date(Date.now());
    return this.getTableDataFromCenterResponseData(centers);
    
  }

  getTableDataFromCenterResponseData(centers: Center[]) {
    let tableDataArray: TableData[] = [];
    for (let i in centers) {
      let center = centers[i];
      for (let j in center.sessions) {
        let session = center.sessions[j]
        if (session.available_capacity !=0 ) {
          let tableData: TableData = {
            session_date: session.date,
            name: center.name,
            address: center.address,
            pincode: center.pincode,
            fee_type: center.fee_type,
            available_capacity: session.available_capacity,
            min_age_limit: session.min_age_limit,
            vaccine: session.vaccine,
            google_map: this.getGmapUrl(center.lat, center.long)
          }
          tableDataArray.push(tableData);
        }        
      }
    }       
    return tableDataArray;
  }

  getSessionsByDateAndDistrict(): Session[] {   
    let sessions: Session[] = []; 
    let qParams =  "?district_id=" + this.districtId + "&date=" + this.searchDate;
    this.request.open('GET', this.BASE_URL + this.DISTRICT_URL + qParams, false);
    this.request.onload = function () { 
      if (this.status >= 200 && this.status < 400) {
        sessions = <Session[]>JSON.parse(this.response)['sessions'];
        sessions = sessions.filter(session => session.available_capacity !== 0);           
      }            
     }
    this.request.send();    
    sessions.forEach(session => {
      session.google_map = this.getGmapUrl(session.lat, session.long);
    });
    this.lastUpdated = new Date(Date.now());
    return sessions;    
  }

  getSessionsByDateAndPincode(): Session[] {   
    let sessions: Session[] = []; 
    let qParams =  "?pincode=" + this.pincode + "&date=" + this.searchDate;
    this.request.open('GET', this.BASE_URL + this.PINCODE_URL + qParams, false);
    this.request.onload = function () { 
      if (this.status >= 200 && this.status < 400) {
        sessions = <Session[]>JSON.parse(this.response)['sessions'];  
        sessions = sessions.filter(session => session.available_capacity !== 0);                 
      }            
     }
    this.request.send();
    sessions.forEach(session => {
      session.google_map = this.getGmapUrl(session.lat, session.long);
    });
    this.lastUpdated = new Date(Date.now());
    return sessions;    
  }

  getDateString(date: Date) {
    return date.toLocaleDateString("es-CL");
  }

  getGmapUrl(lat, long) {
    return "https://www.google.com/maps/search/?api=1&query=" + lat + "," + long;
  }

}
