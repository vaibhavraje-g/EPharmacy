import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { AuthService } from '../../shared/services/auth-service/auth.service';
import { CustomerCartService } from '../../shared/services/customer-cart/customer-cart.service';
import { BehaviorSubject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  loggedInPerson: string | undefined;
  loggedInCustomerId!: number;
  loggedIn: boolean = false;
  public cartItemCount$ = new BehaviorSubject<number>(0);

  @Output() logoutEvent = new EventEmitter<void>();

  constructor(
    private router: Router,
    private auth: AuthService,
    private customerCartService: CustomerCartService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to auth state and update UI accordingly
    this.auth.authState.subscribe((isLoggedIn) => {
      this.loggedIn = isLoggedIn;
      if (this.loggedIn) {
        this.updateUserDetails();
        this.updateCart();
      } else {
        this.cartItemCount$.next(0);
        this.loggedInPerson = undefined;
      }
    });

    // Subscribe to cart item count changes
    this.customerCartService.getCartItemCount().subscribe(
      (count) => {
        this.cartItemCount$.next(count);
      },
      (error) => {
        console.error('Error fetching cart item count:', error);
        this.cartItemCount$.next(0); // Reset to 0 in case of error
      }
    );
  }

  ngOnInit(): void {
    this.loggedIn = this.auth.isLoggedIn();
    if (this.loggedIn) {
      this.updateUserDetails();
      this.updateCart();
    }
  }

  private updateUserDetails(): void {
    const user = this.auth.getUserDetails();
    this.loggedInPerson = user.customerName;
    this.loggedInCustomerId = user.customerId;
    this.cdr.detectChanges(); // Trigger change detection if needed
  }

  private updateCart(): void {
    if (this.loggedInCustomerId) {
      this.customerCartService
        .getMedicinesInCart(this.loggedInCustomerId)
        .subscribe(
          (response) => {
            this.cartItemCount$.next(response.data.length);
          },
          (error) => {
            console.error('Error fetching cart items:', error);
            this.cartItemCount$.next(0); // Reset to 0 in case of error
          }
        );
    }
  }

  logout(): void {
    this.auth.logout();
    this.loggedIn = false;
    this.cartItemCount$.next(0); // Reset cart count on logout
    this.router.navigate(['medicine']);
    this.logoutEvent.emit(); // Emit logout event
  }
}
