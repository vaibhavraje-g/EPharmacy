import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerCartService } from '../../shared/services/customer-cart/customer-cart.service';
import { MedicineService } from '../../shared/services/medicine-service/medicine.service';

@Component({
  selector: 'app-customer-cart',
  templateUrl: './customer-cart.component.html',
  styleUrls: ['./customer-cart.component.css'],
})
export class CustomerCartComponent implements OnInit {
  cartItems: any[] = [];
  cartItemIds: number[] = [];
  customerId: number = 1;
  errorMessage: string = '';
  successMessage: string = '';
  successItemMessage: string = '';

  constructor(
    @Inject(CustomerCartService) private cartService: CustomerCartService,
    private medicineService: MedicineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerId = sessionStorage.getItem('customerId') as unknown as number;
    this.getCustomerCart();
  }

  // Fetches cart items from the cart service
  getCustomerCart(): void {
    this.cartService.getMedicinesInCart(this.customerId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.fetchMedicineDetails(response.data);
        } else {
          this.errorMessage = 'No cart items found.';
        }
      },
      error: (err: any) =>
        this.handleError('Failed to retrieve cart items', err),
    });
  }

  // Fetches medicine details for each cart item
  fetchMedicineDetails(cartItems: any[]): void {
    this.cartItems = [];
    this.errorMessage = '';
    this.successMessage = ''; // Clear general success message

    cartItems.forEach((cartItem: any, index: number) => {
      this.medicineService.getMedicineById(cartItem.medicineId).subscribe({
        next: (medicineResponse: any) => {
          this.cartItems.push({
            ...medicineResponse.data,
            quantity: cartItem.quantity,
            _id: cartItem._id,
          });

          if (index === cartItems.length - 1) {
            this.successMessage = 'Cart items loaded successfully';
            this.autoHideMessage('successMessage');
          }
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to fetch medicine details';
          console.error(err);
          this.autoHideMessage('errorMessage');
        },
      });
    });
  }

  // Handles error messages
  handleError(message: string, err: any): void {
    this.errorMessage = message;
    this.successMessage = ''; // Clear success message
    console.error(err);
    this.autoHideMessage('errorMessage');
  }

  // Update the quantity of a medicine in the cart
  updateQuantity(operation: string, cartItem: any) {
    let newQuantity = cartItem.quantity;

    if (operation === 'increase') {
      newQuantity++;
    } else if (operation === 'decrease' && newQuantity > 1) {
      newQuantity--;
    }

    this.cartService
      .updateMedicineQuantity(cartItem.medicineId, this.customerId, newQuantity)
      .subscribe({
        next: () => {
          cartItem.quantity = newQuantity;
          this.successMessage = 'Quantity updated successfully';
          this.errorMessage = '';
          this.autoHideMessage('successMessage');
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update quantity';
          this.successMessage = '';
          console.error(err);
          this.autoHideMessage('errorMessage');
        },
      });
  }

  // Remove a specific medicine from the cart
  deleteMedicineFromCart(cartItem: any) {
    this.cartService
      .deleteMedicineFromCart(cartItem.medicineId, this.customerId)
      .subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(
            (item) => item.medicineId !== cartItem.medicineId
          );
          this.successItemMessage = `${cartItem.medicineName} removed from cart`; // Success message with item name
          this.errorMessage = '';
          this.autoHideMessage('successItemMessage');
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to delete medicine from cart';
          this.successItemMessage = ''; // Clear item-specific success message
          console.error(err);
          this.autoHideMessage('errorMessage');
        },
      });
  }

  // Remove all medicines from the cart
  deleteAllMedicinesFromCart() {
    this.cartService.deleteAllMedicinesFromCart(this.customerId).subscribe({
      next: () => {
        this.cartItems = [];
        this.successMessage = 'All medicines cleared from cart';
        this.errorMessage = '';
        this.autoHideMessage('successMessage');
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to delete all medicines from cart';
        this.successMessage = ''; // Clear success message
        console.error(err);
        this.autoHideMessage('errorMessage');
      },
    });
  }

  // Get total amount of the cart
  getTotalAmount(): number {
    return this.cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  // Automatically hide messages after a few seconds
  autoHideMessage(messageType: string): void {
    setTimeout(() => {
      if (messageType === 'successMessage') {
        this.successMessage = ''; // Clear success message
      } else if (messageType === 'errorMessage') {
        this.errorMessage = ''; // Clear error message
      } else if (messageType === 'successItemMessage') {
        this.successItemMessage = ''; // Clear item-specific success message
      }
    }, 1000); // Hide message after 3 seconds
  }

  placeOrder(): void {
    this.router.navigate(['placeOrder']);
  }
}
