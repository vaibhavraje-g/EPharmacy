import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/services/auth-service/auth.service';
import { CustomerCartService } from './shared/services/customer-cart/customer-cart.service';

@Component({
  selector: 'app-root',
  template: `
    <div style="overflow: hidden;">
      <app-navbar (logoutEvent)="logout()"></app-navbar>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  loggedInPerson: string | undefined;
  loggedInCustomerId!: number;
  loggedIn: Boolean = false;
  cart: any[] = [];
  role!: string;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private customerCartService: CustomerCartService
  ) {}

  ngOnInit(): void {
    this.auth.sessionCustomer.subscribe((data) => {
      if (this.auth.isLoggedIn()) {
        this.loggedInPerson = data.customerName;
        this.loggedInCustomerId = data.customerId;
        this.role = 'Customer';
        this.loggedIn = true;
        this.getCustomerCart();
      } else {
        this.logout();
      }
    });
  }

  getCustomerCart(): void {
    if (this.loggedInCustomerId) {
      this.customerCartService
        .getMedicinesInCart(this.loggedInCustomerId)
        .subscribe({
          next: (response: any) => {
            if (response.status === 'success') {
              this.cart = response.data;
            } else {
              this.errorMessage = 'No cart items found.';
            }
          },
          error: (err: any) => {
            this.handleError('Failed to retrieve cart items', err);
          },
        });
    }
  }

  handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(message, error);
  }

  logout(): void {
    this.auth.logout();
    this.loggedIn = false;
    this.loggedInPerson = undefined;
    this.loggedInCustomerId = 0;
    this.cart = [];
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}


