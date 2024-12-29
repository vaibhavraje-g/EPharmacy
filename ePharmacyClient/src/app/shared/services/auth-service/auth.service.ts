import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public sessionCustomer: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
  private authState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadSessionCustomer();
  }

  // Load customer session from localStorage
  private loadSessionCustomer(): void {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        if (customer && customer.customerName && customer.customerId) {
          this.sessionCustomer.next(customer);
          this.authState.next(true);
        } else {
          this.clearSession();
        }
      } catch (e) {
        console.error('Error parsing customer data from localStorage', e);
        this.clearSession();
      }
    } else {
      this.clearSession();
    }
  }

  // Update the customer session
  public nextCustomer(data: any): void {
    this.sessionCustomer.next(data);
    localStorage.setItem('customer', JSON.stringify(data));
    this.authState.next(true);
  }

  // Check if the user is logged in
  public isLoggedIn(): boolean {
    return this.authState.value;
  }

  // Get user details
  public getUserDetails(): any | null {
    return this.sessionCustomer.value;
  }

  // Logout the user
  public logout(): void {
    this.clearSession();
  }

  // Clear session data
  private clearSession(): void {
    localStorage.removeItem('customer');
    this.sessionCustomer.next(null);
    this.authState.next(false);
  }

  // Login function (for server-side authentication)
  public login(credentials: { username: string; password: string }): Observable<any> {
    const apiUrl = 'your-api-endpoint/login'; // Replace with your API endpoint
    return this.http.post<any>(apiUrl, credentials).pipe(
      tap((customer: any) => {
        this.nextCustomer(customer);
      }),
      catchError((error) => {
        console.error('Login failed', error);
        throw error; // Re-throw to handle in the component
      })
    );
  }

  // Observable for authentication state
  public getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }

  // Observable for customer session
  public getSessionCustomer(): Observable<any | null> {
    return this.sessionCustomer.asObservable();
  }
}
