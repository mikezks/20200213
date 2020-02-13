import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, timer, Subscription } from 'rxjs';
import { switchMap, tap, share, distinctUntilChanged, debounceTime, filter } from 'rxjs/operators';
import { Flight } from '@flight-workspace/flight-api';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-flight-typeahead',
  templateUrl: './flight-typeahead.component.html',
  styleUrls: ['./flight-typeahead.component.css']
})
export class FlightTypeaheadComponent implements OnInit, OnDestroy {
  timer$: Observable<number>;
  timerSubscription: Subscription;

  control = new FormControl();
  flights$: Observable<Flight[]>;
  loading: boolean;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.timer$ = 
      timer(0, 1000)
        .pipe(
          tap(console.log),
          share()
        );

    /* this.timerSubscription =
      this.timer$
        .subscribe(); */

    this.flights$ =
      this.control.valueChanges
        .pipe(
          debounceTime(300),
          filter(from => from.length > 2),
          distinctUntilChanged(),
          tap(() => this.loading = true),
          switchMap(from => this.load(from)),
          tap(() => this.loading = false)
        );
  }

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';

    const params = new HttpParams()
      .set('from', from);

    let headers = new HttpHeaders()
      .set('Accept', 'application/json');

    const reqObj = { params, headers };
    return this.http.get<Flight[]>(url, reqObj);
  }

  ngOnDestroy(): void {
    //this.timerSubscription.unsubscribe();
  }

}
