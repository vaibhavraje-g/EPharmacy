import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../shared/services/customer-service/customer.service';
import { CustomerCartService } from '../../shared/services/customer-cart/customer-cart.service';
import { PlaceOrderService } from '../../shared/services/place-order-service/place-order.service';
import { PaymentsService } from '../../shared/services/payments-service/payments.service';
import { MedicineService } from '../../shared/services/medicine-service/medicine.service';


@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.css'],
})
export class PlaceOrderComponent implements OnInit {
  // VARIABLES
  loggedInCustomerId!: number;
  userAddresses: any[] = [];
  cartItems: any[] = [];
  selectedAddress: any = null;
  selectedCard: any = null;
  cards: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  currentStep: number = 0;
  totalDiscount: number = 0; // Total discount
  amount: number = 0; // Amount before discount
  healthCoinsUsed: number = 0; // Health coins used in the payment
  finalTotal: number = 0; // Final total after discount and health coins
  customerDetails: any = {};
  originalPrice: number = 1624.0; // Example original price
  discountPercentage: number = 10; // Example discount
  discountedTotal: number = 0; // Example discounted total
  cvv: any;

  constructor(
    private customerService: CustomerService,
    private customerCartService: CustomerCartService,
    private placeOrderService: PlaceOrderService,
    private paymentsService: PaymentsService,
    private medicineService: MedicineService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loggedInCustomerId = Number(sessionStorage.getItem('customerId'));

    try {
      await this.loadCustomerDetailsAndAddresses();
      await this.loadCartItems();
      await this.loadCustomerCards();
      await this.calculatePaymentDetails();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // PAYMENT CALCULATION FUNCTIONS

  private async calculatePaymentDetails(): Promise<void> {
    this.amount = await this.getTotalAmount();

    this.totalDiscount = this.calculateDiscount(this.amount);

    this.healthCoinsUsed = this.customerDetails.healthCoins;

    this.discountedTotal = this.amount - this.totalDiscount;

    this.finalTotal = this.discountedTotal - this.healthCoinsUsed;

    if (this.finalTotal < 0) {
      this.finalTotal = 0;
    }
    this.originalPrice = this.amount;
    this.discountPercentage = (this.totalDiscount / this.amount) * 100;
  }

  private calculateDiscount(amount: number): number {
    if (amount > 3000) {
      return amount * 0.3; // 30% discount
    } else if (amount > 2000) {
      return amount * 0.2; // 20% discount
    } else if (amount > 1000) {
      return amount * 0.1; // 10% discount
    } else {
      return 0; // No discount
    }
  }

  // DATA LOADING FUNCTIONS

  private async loadCustomerDetailsAndAddresses(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loggedInCustomerId) {
        this.customerService
          .getCustomerDetails(this.loggedInCustomerId)
          .subscribe({
            next: (response) => {
              this.customerDetails = response.data;
              this.userAddresses = response.data.addressList;
              resolve();
            },
            error: () => {
              this.showError('Failed to load customer details and addresses');
              reject();
            },
          });
      } else {
        this.showError('No customer ID found');
        reject();
      }
    });
  }

  private loadCartItems(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loggedInCustomerId) {
        this.customerCartService
          .getMedicinesInCart(this.loggedInCustomerId)
          .subscribe({
            next: (response) => {
              if (response.status === 'success') {
                this.cartItems = response.data;
                resolve();
              } else {
                this.showError('No cart items found');
                reject();
              }
            },
            error: () => {
              this.showError('Failed to load cart items');
              reject();
            },
          });
      }
    });
  }

  private loadCustomerCards(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loggedInCustomerId) {
        this.paymentsService
          .viewCards(this.loggedInCustomerId.toString())
          .subscribe({
            next: (response) => {
              this.cards = response.data;
              resolve();
            },
            error: () => {
              this.showError('Failed to load cards');
              reject();
            },
          });
      }
    });
  }

  // SUCCESS AND ERROR HANDLING FUNCTIONS

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.autoHideMessage();
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.autoHideMessage();
  }

  private autoHideMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  // USER INTERACTION HANDLERS

  selectAddress(address: any): void {
    this.selectedAddress = address;
    this.showSuccess('Address selected successfully!');
  }

  addNewAddress(): void {}

  selectCard(card: any): void {
    this.selectedCard = card;
    this.showSuccess('Card selected successfully!');
  }

  addNewCard(): void {}

  // PAYMENT AND ORDER CREATION FUNCTIONS

  async placeOrder(): Promise<void> {
    const orderPayload: any = await this.createOrderPayload();
    console.log(orderPayload);

    this.placeOrderService.placeOrder(orderPayload).subscribe({
      next: (response) => {
        console.log(response);
        if (
          response.message ===
          'Order placed successfully and payment processed.'
        ) {
          this.showSuccess('Payment successful! Your order is placed.');
          console.log('Order placed successfully');
          this.clearCart();
          this.nextStep();
          this.deleteAllMedicinesFromCart()
        } else {
          this.showError('Failed to place the order');
        }
      },
      error: () => {
        this.showError('Failed to process payment');
      },
    });
  }

   // Remove all medicines from the cart
   deleteAllMedicinesFromCart() {
    this.customerCartService.deleteAllMedicinesFromCart(this.loggedInCustomerId).subscribe({
      next: () => {
        this.cartItems = [];
        this.successMessage = 'All medicines cleared from cart';
        this.errorMessage = '';
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to delete all medicines from cart';
        this.successMessage = ''; // Clear success message
        console.error(err);
      },
    });
  }

  private async createOrderPayload(): Promise<any> {
    return {
      orderValue: await this.getTotalAmount(),
      customer: { customerId: this.loggedInCustomerId },
      deliveryAddress: { addressId: this.selectedAddress._id },
      card: {
        cardId: this.selectedCard.cardId,
        nameOnCard: this.selectedCard.nameOnCard,
        cardType: this.selectedCard.cardType,
        cvv: this.cvv,
        expiryDate: this.selectedCard.expiryDate,
        customerId: this.loggedInCustomerId,
      },
      customerId: this.loggedInCustomerId,
    };
  }

  private clearCart(): void {
    this.customerCartService
      .deleteAllMedicinesFromCart(this.loggedInCustomerId)
      .subscribe({
        next: () => {
          this.cartItems = [];
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }

  // HELPER FUNCTION: GET TOTAL AMOUNT

  async getTotalAmount(): Promise<number> {
    let totalAmount = 0;

    for (const cartItem of this.cartItems) {
      try {
        const medicineResponse: any = await this.medicineService
          .getMedicineById(cartItem.medicineId)
          .toPromise();
        const medicinePrice = medicineResponse.data.price;
        totalAmount += medicinePrice * cartItem.quantity;
      } catch (error) {
        console.error('Failed to fetch medicine details:', error);
      }
    }

    return totalAmount;
  }

  // HELPER FUNCTION: FETCH MEDICINE DETAILS

  fetchMedicineDetails(cartItems: any[]): void {
    this.cartItems = [];
    this.errorMessage = '';
    this.successMessage = '';

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
            this.autoHideMessage();
          }
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to fetch medicine details';
          console.error(err);
          this.autoHideMessage();
        },
      });
    });
  }

  // STEP NAVIGATION FUNCTIONS

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--; // Decrease step index
    }
  }

  nextStep(): void {
    if (this.currentStep < 2) {
      this.currentStep++; // Increase step index
    }
  }
}
