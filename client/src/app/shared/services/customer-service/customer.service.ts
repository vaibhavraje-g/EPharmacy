import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = environment.customerMSUrl;

  constructor(private http: HttpClient) {}

  getCustomerDetails(customerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}customer/${customerId}`);
  }
}
