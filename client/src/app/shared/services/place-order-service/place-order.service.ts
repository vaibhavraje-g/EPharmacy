import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaceOrderService {
  
  private apiUrl = environment.orderMSUrl;

  constructor(private http: HttpClient) {}

  placeOrder(orderPayload: any): Observable<any>  {
    return this.http.post(
      `${this.apiUrl}order/place-order`, orderPayload
    );
  }
}
