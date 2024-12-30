import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}
  customerLogInUrl = environment.customerMSUrl + 'customer/login';

  loginCustomer(data: any): Observable<any> {
    var customer: any = {};
    customer.customerEmailId = data.emailId;
    customer.password = data.password;
    return this.http.post<any>(this.customerLogInUrl, customer);
  }
}