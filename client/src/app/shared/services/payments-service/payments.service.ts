import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = environment.paymentMSUrl;

  constructor(private http: HttpClient) { }

  payAmount(amountToPay: number): Observable<any> {
    return this.http.post(`${this.apiUrl}payment/amount/${amountToPay}`, {});
  }

  viewCards(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}payment/view-cards/${customerId}`);
  }

  addCard(customerId: string, cardDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}payment/add-card/${customerId}`, cardDetails);
  }
}
