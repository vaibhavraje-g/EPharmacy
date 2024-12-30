import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  sessionCustomer: BehaviorSubject<any> = new BehaviorSubject<any>({});

  authState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadSessionCustomer();
  }

  loadSessionCustomer() {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      const customer = JSON.parse(customerData);
      this.sessionCustomer.next(customer);
      this.authState.next(true);
    } else {
      this.authState.next(false);
    }
  }

  nextCustomer(data: any) {
    this.sessionCustomer.next(data);
    localStorage.setItem('customer', JSON.stringify(data));
    this.authState.next(true);
  }

  isLoggedIn(): boolean {
    const customer = this.sessionCustomer.value;
    return !!customer.customerName && !!customer.customerId;
  }

  getUserDetails(): any {
    return this.sessionCustomer.value;
  }

  logout(): void {
    localStorage.removeItem('customer');
    this.authState.next(false);
  }
}
