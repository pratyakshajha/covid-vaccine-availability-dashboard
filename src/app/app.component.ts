import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Center, District, Session, TableData } from './services/constants/models';
import { CowinService } from './services/cowin/cowin.service';
import * as districtsJson from './services/constants/districts.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('paginator', {static: true},) paginator: MatPaginator;
  @ViewChild('sort') sort: MatSort;
  @ViewChild('weekPaginator', {static: true}) weekPaginator: MatPaginator;
  @ViewChild('weekSort') weekSort: MatSort;
  columnsToDisplay = ['date', 'name', 'address', 'pincode', 'fee', 'available_capacity', 'min_age_limit', 'vaccine'];
  weekColumnsToDisplay = ['sessionDate', 'name', 'address', 'pincode', 'feeType', 'availableCapacity', 'minAgeLimit', 'vaccine'];
  dataSource: MatTableDataSource<Session> = new MatTableDataSource();
  weekDataSource: MatTableDataSource<TableData> = new MatTableDataSource();

  cowinService: CowinService = new CowinService();

  dateControl = new FormControl('');
  dateLabel: string = new Date(this.cowinService.today.setDate(this.cowinService.today.getDate() + 1)).toLocaleDateString('en-IN');
  pincodeControl = new FormControl('');
  districtControl = new FormControl('');
  districtOptions: District[] = <District[]>(districtsJson as any).default['districts'];
  filteredDistrictOptions: Observable<District[]>;  
  formError: boolean = false;
  formErrorMsg: String = 'Error!';

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.cowinService.getSessionsByDateAndDistrict());
    this.weekDataSource = new MatTableDataSource(this.cowinService.getSessionNextWeekByDateAndDistrict());
    
    this.filteredDistrictOptions = this.districtControl.valueChanges
    .pipe(
        startWith(''),
        map((value) => typeof value === 'string' ? value : value.name),
        map((name) => name ? this._filter(name) : this.districtOptions.slice())
      );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.weekDataSource.paginator = this.weekPaginator;
    this.weekDataSource.sort = this.weekSort;
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

      this.dataSource = new MatTableDataSource(this.cowinService.getSessionsByDateAndDistrict());
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      this.weekDataSource = new MatTableDataSource(this.cowinService.getSessionNextWeekByDateAndDistrict());
      this.weekDataSource.paginator = this.weekPaginator;
      this.weekDataSource.sort = this.weekSort;

      this.formError = false;
      this.pincodeControl.setValue('');
    } else {
      this.formError = true;
      this.formErrorMsg = 'Select a district';
    }
  }

  updateTableByPincode() {    
    let pincode: string = this.pincodeControl.value;
    let searchDate: string =  this.dateControl.value;    
    if (searchDate != '') {
      this.cowinService.searchDate = this.cowinService.getDateString(new Date(searchDate));
    }
    if (!pincode.match("[0-9]{6}")) {
      this.formError = true;
      this.formErrorMsg = 'Select a valid pincode';
    } else {
      this.cowinService.pincode = pincode;

      this.dataSource = new MatTableDataSource(this.cowinService.getSessionsByDateAndPincode());
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.weekDataSource = new MatTableDataSource(this.cowinService.getSessionNextWeekByDateAndPincode());
      this.weekDataSource.paginator = this.weekPaginator;
      this.weekDataSource.sort = this.weekSort;

      this.formError = false;
      this.districtControl.setValue('');
    }
    this.districtControl.setValue('');
  }

}

