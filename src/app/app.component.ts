import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { District, Session, TableData } from './services/constants/models';
import { CowinService } from './services/cowin/cowin.service';
import * as districtsJson from './services/constants/districts.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  @ViewChild('paginator', {static: true},) paginator: MatPaginator;
  @ViewChild('sort') sort: MatSort;
  @ViewChild('weekPaginator', {static: true}) weekPaginator: MatPaginator;
  @ViewChild('weekSort') weekSort: MatSort;
  columnsToDisplay = ['date', 'name', 'address', 'pincode', 'fee', 'available_capacity', 'min_age_limit', 'vaccine'];
  weekColumnsToDisplay = ['session_date', 'name', 'address', 'pincode', 'fee_type', 'available_capacity', 'min_age_limit', 'vaccine'];
  dataSource: MatTableDataSource<Session> = new MatTableDataSource();
  weekDataSource: MatTableDataSource<TableData> = new MatTableDataSource();
  data: Session[];
  weekData: TableData[];

  cowinService: CowinService = new CowinService();
  lastUpdated: Date = new Date(Date.now());
  lastUpdatedByDistrict: boolean = true;

  dateControl = new FormControl(this.cowinService.today);
  pincodeControl = new FormControl('');
  districtControl = new FormControl({"district_id": 365,"district_name": "Nagpur"});
  districtOptions: District[] = <District[]>(districtsJson as any).default;
  filteredDistrictOptions: Observable<District[]>; 
  ageRangeControl = new FormControl('63') 
  formError: boolean = false;
  formErrorMsg: String = 'Error!';

  ngOnInit(): void {
    this.data = this.cowinService.getSessionsByDateAndDistrict();
    this.weekData = this.cowinService.getSessionNextWeekByDateAndDistrict();
    this.updateDatasources(this.data, this.weekData);

    this.filteredDistrictOptions = this.districtControl.valueChanges
    .pipe(
        startWith(''),
        map((value) => typeof value === 'string' ? value : value.name),
        map((name) => name ? this._filter(name) : this.districtOptions.slice())
      );
    this.refreshData();
  }

  displayFn(district: District): string {
    return district && district.district_name ? district.district_name : '';
  }

  private _filter(name: string): District[] {
    const filterValue = name.toLowerCase();
    return this.districtOptions.filter(districtOptions => districtOptions.district_name.toLowerCase().indexOf(filterValue) === 0);
  }

  updateTableByDistrict() {
    let district_id: string = this.districtControl.value.district_id;
    let searchDate: string =  this.dateControl.value;    
    if (searchDate != '') {
      this.cowinService.searchDate = this.cowinService.getDateString(new Date(searchDate));
    }
    if (district_id != undefined) {    
      this.cowinService.districtId = district_id;

      this.data = this.cowinService.getSessionsByDateAndDistrict();
      this.weekData = this.cowinService.getSessionNextWeekByDateAndDistrict();
      this.updateDatasources(this.data, this.weekData);

      this.lastUpdatedByDistrict = true;
      this.formError = false;
      this.pincodeControl.setValue('');
    } else {
      this.formError = true;
      this.formErrorMsg = 'Select a district';
    }
  }

  updateTableByPincode() {    
    let pincode: string = this.pincodeControl.value.trim();
    let searchDate: string =  this.dateControl.value;    
    if (searchDate != '') {
      this.cowinService.searchDate = this.cowinService.getDateString(new Date(searchDate));
    }
    if (!pincode.match("[0-9]{6}")) {
      this.formError = true;
      this.formErrorMsg = 'Select a valid pincode';
    } else {
      this.cowinService.pincode = pincode;

      this.data = this.cowinService.getSessionsByDateAndPincode();
      this.weekData = this.cowinService.getSessionNextWeekByDateAndPincode();
      this.updateDatasources(this.data, this.weekData);

      this.lastUpdatedByDistrict = false;
      this.formError = false;
      this.districtControl.setValue('');
    }
    this.districtControl.setValue('');
  }

  updateAgeRange() {    
    let ageRange: string = this.ageRangeControl.value;
    let filteredData: Session[];    
    let filteredWeekData: TableData[];    
    switch (ageRange) {
      case "63":
        this.updateDatasources(this.data, this.weekData);
      break;
      case "45":
        filteredData = this.data.filter(session => session.min_age_limit === 45);
        filteredWeekData = this.weekData.filter(tableData => tableData.min_age_limit === 45);
        this.updateDatasources(filteredData, filteredWeekData);
      break;
      case "18":
        filteredData = this.data.filter(session => session.min_age_limit === 18);
        filteredWeekData = this.weekData.filter(tableData => tableData.min_age_limit === 18);
        this.updateDatasources(filteredData, filteredWeekData);
      break;
    }
  }

  refreshData() {
    setInterval(() => {
        if (this.lastUpdatedByDistrict) {
          this.updateTableByDistrict();
        }
        else {
          this.updateTableByPincode();
        }
        this.updateAgeRange();
    }, 60000) //ms
  }

  updateDatasources(data: Session[], weekData: TableData[]) {
    this.lastUpdated = this.cowinService.lastUpdated
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.weekDataSource = new MatTableDataSource(weekData);
    this.weekDataSource.paginator = this.weekPaginator;
    this.weekDataSource.sort = this.weekSort;    
  }
}

