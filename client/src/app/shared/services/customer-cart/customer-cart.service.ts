import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CustomerCartService {
  private readonly apiUrl = `${environment.cartMSUrl}cart/`;
  private cartItemCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Get an observable for the current cart item count.
   */
  getCartItemCount(): Observable<number> {
    return this.cartItemCount.asObservable();
  }

  /**
   * Update the cart item count by fetching the current cart items for a customer.
   * @param customerId Customer's ID
   */
  private updateCartItemCount(customerId: number): void {
    this.getMedicinesInCart(customerId).subscribe((response) => {
      this.cartItemCount.next(response.data.length || 0);
    });
  }

  /**
   * Add a medicine to the customer's cart.
   * @param medicineId Medicine's ID
   * @param customerId Customer's ID
   * @param quantity Quantity to add
   */
  addMedicineToCart(
    medicineId: number,
    customerId: number,
    quantity: number
  ): Observable<any> {
    return this.http
      .post(`${this.apiUrl}addmedicine/${medicineId}/customer/${customerId}`, {
        quantity,
      })
      .pipe(tap(() => this.updateCartItemCount(customerId)));
  }

  /**
   * Fetch all medicines in the customer's cart.
   * @param customerId Customer's ID
   */
  getMedicinesInCart(customerId: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}medicines/customer/${customerId}`);
  }

  /**
   * Update the quantity of a specific medicine in the customer's cart.
   * @param medicineId Medicine's ID
   * @param customerId Customer's ID
   * @param quantity New quantity
   */
  updateMedicineQuantity(
    medicineId: number,
    customerId: number,
    quantity: number
  ): Observable<any> {
    return this.http
      .put(`${this.apiUrl}updatequantity/medicine/${medicineId}/customer/${customerId}`, {
        quantity,
      })
      .pipe(tap(() => this.updateCartItemCount(customerId)));
  }

  /**
   * Delete a specific medicine from the customer's cart.
   * @param medicineId Medicine's ID
   * @param customerId Customer's ID
   */
  deleteMedicineFromCart(
    medicineId: number,
    customerId: number
  ): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}delete-medicines/${medicineId}/customer/${customerId}`)
      .pipe(tap(() => this.updateCartItemCount(customerId)));
  }

  /**
   * Delete all medicines from the customer's cart.
   * @param customerId Customer's ID
   */
  deleteAllMedicinesFromCart(customerId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}delete-medicines/customer/${customerId}`)
      .pipe(tap(() => this.updateCartItemCount(customerId)));
  }
}
