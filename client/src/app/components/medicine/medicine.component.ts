import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { MedicineService } from '../../shared/services/medicine-service/medicine.service';
import { CustomerCartService } from 'src/app/shared/services/customer-cart/customer-cart.service';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.css'],
})
export class MedicineComponent implements OnInit {
  medicineListToDisplay: any[] = [];
  medicineList: any[] = [];
  errorMessage!: string;
  successMessage!: string;
  searchText!: string;
  category!: string;
  viewDetails: boolean = false;
  selectedMedicine!: any;
  actualPrice!: number;
  loggedIn: boolean = false;
  id!: string | null;
  pageNumber: number = 0;
  medicineNames!: string[];
  filteredMedicines: string[] = [];
  displayLength = 0;
  startIndex = 0;
  endIndex = 10;

  constructor(
    private medicineService: MedicineService,
    private auth: AuthService,
    private customerCartService: CustomerCartService
  ) {}

  ngOnInit(): void {
    this.id = sessionStorage.getItem('customerId');
    if (this.id != null || this.id != undefined) {
      this.loggedIn = true;
    }
    this.getAllMedicines();
  }

  onSearchTextChange() {
    // Filter medicines based on the search text
    this.filteredMedicines = this.medicineNames.filter(medicineName =>
      medicineName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  getAllMedicines() {
    this.medicineService.getAllMedicines(this.pageNumber).subscribe(
      (medicines) => {
        this.medicineList = medicines;
        this.medicineListToDisplay = this.medicineList;
        this.medicineNames = this.medicineList.map(
          (medicine) => medicine.medicineName
        );
        this.getMedicineListToDisplay();
      },
      (errorResponse) => {
        this.errorMessage = errorResponse.error.message;
      }
    );
  }

  // Get the medicines to display (with pagination)
  getMedicineListToDisplay(): any[] {
    this.displayLength = this.medicineListToDisplay.length;
    if (this.medicineListToDisplay.length > this.endIndex) {
      return this.medicineListToDisplay.slice(
        this.startIndex,
        this.endIndex + 1
      );
    }
    return this.medicineListToDisplay.slice(
      this.startIndex,
      this.medicineListToDisplay.length
    );
  }

  onNext(): void {
    if (this.endIndex < this.displayLength) {
      this.startIndex = this.endIndex + 1;
      this.endIndex = this.startIndex + 10;
    }
  }

  onPrevious(): void {
    if (this.startIndex > 0) {
      this.startIndex = this.startIndex - 30;
      this.endIndex = this.endIndex - 30;
    }
  }

  // Sorting functions
  sortLowToHigh(): void {
    this.medicineListToDisplay = [...this.medicineListToDisplay].sort(
      (a, b) => a.price - b.price
    );
    this.startIndex = 0;
    this.endIndex = 10;
  }

  sortHighToLow(): void {
    this.medicineListToDisplay = [...this.medicineListToDisplay].sort(
      (a, b) => b.price - a.price
    );
    this.startIndex = 0;
    this.endIndex = 10;
  }

  sortAtoZ(): void {
    this.medicineListToDisplay = [...this.medicineListToDisplay].sort((a, b) =>
      a.medicineName.localeCompare(b.medicineName)
    );
    this.startIndex = 0;
    this.endIndex = 10; // Reset pagination
  }

  sortZtoA(): void {
    this.medicineListToDisplay = [...this.medicineListToDisplay].sort((a, b) =>
      b.medicineName.localeCompare(a.medicineName)
    );
    this.startIndex = 0;
    this.endIndex = 10;
  }

  // Add to cart functionality
  addToCart(medicineId:any) {
    if (this.loggedIn) {
      // Check if id is null
      
      const customerId = this.id ? parseInt(this.id) : null;

      if (customerId !== null) {
        const quantity = 1;

        // Call the service method to add the item to the cart, passing the arguments
        this.customerCartService
          .addMedicineToCart(medicineId, customerId, quantity)
          .subscribe(
            (response) => {
              this.successMessage = response.message;
            },
            (errorResponse) => {
              this.errorMessage = errorResponse.error.message;
            }
          );
      } else {
        this.errorMessage = 'Customer ID is missing or invalid';
      }
    } else {
      this.errorMessage = 'Please login to add to cart';
    }
  }

  // Update the quantity of a medicine in the cart
  updateQuantity(operation: string, cartItem: any) {
    let newQuantity = cartItem.quantity;
    const customerId = this.id ? parseInt(this.id): 0;

    if (operation === 'increase') {
      newQuantity++;
    } else if (operation === 'decrease' && newQuantity > 1) {
      newQuantity--;
    }

    this.customerCartService
      .updateMedicineQuantity(cartItem.medicineId, customerId, newQuantity)
      .subscribe({
        next: () => {
          cartItem.quantity = newQuantity;
          this.successMessage = 'Quantity updated successfully';
          this.errorMessage = '';
          
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update quantity';
          this.successMessage = '';
          console.error(err);
        
        },
      });
  }

  // Category filter functionality
  categorise() {
    this.category = this.category.trim();
    if (this.category) {
      this.medicineListToDisplay = this.medicineList.filter(
        (medicine) =>
          medicine.category.toLowerCase() === this.category.toLowerCase()
      );
    } else {
      this.medicineListToDisplay = this.medicineList; 
    }
    this.startIndex = 0; 
    this.endIndex = 10;
  }

  // Reset the view to show all medicines
  clear() {
    this.medicineListToDisplay = this.medicineList;
    this.searchText = '';
  }

  // Search function
  search() {
    if (this.searchText) {
      this.medicineListToDisplay = this.medicineList.filter((medicine) =>
        medicine.medicineName
          .toLowerCase()
          .includes(this.searchText.toLowerCase())
      );
    } else {
      this.medicineListToDisplay = this.medicineList;
    }
    this.startIndex = 0;
    this.endIndex = 10;
  }

  // Set selected medicine for view details
  setSelectedMedicine(medicine: any) {
    this.viewDetails = true;
    this.selectedMedicine = medicine;
    this.actualPrice =
      (this.selectedMedicine.price * 100) /
      (100 - this.selectedMedicine.discountPercent);
  }

  // Go back from the medicine details view
  goBack() {
    this.viewDetails = false;
    this.successMessage = '';
    this.errorMessage = '';
  }
}
