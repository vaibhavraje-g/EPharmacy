import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerCartComponent } from './components/customer-cart/customer-cart.component';
import { LoginComponent } from './components/login/login.component';
import { MedicineComponent } from './components/medicine/medicine.component';
import { PlaceOrderComponent } from './components/place-order/place-order.component';
import { RegisterComponent } from './components/register/register.component';


const routes: Routes = [
  { path : 'medicine', component: MedicineComponent },
  { path : 'login', component:LoginComponent},
  { path : 'register', component:RegisterComponent},
  { path : 'customerCart', component:CustomerCartComponent},
  { path : 'placeOrder', component:PlaceOrderComponent},
  { path : '', redirectTo: '/medicine', pathMatch: "full" },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }