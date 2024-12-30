import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient) {}
  registerCustomerUrl = environment.customerMSUrl + 'customer/register';

  registerCustomer(data: any): Observable<string> {
    const cust: any = {
      contactNumber: data.mobile,
      customerEmailId: data.email,
      customerName: data.fullName,
      password: data.password,
      gender: data.gender,
      dateOfBirth: data.dob,
      addressList: [],
    };

    if (data.state !== '') {
      const address = {
        state: data.state,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        area: data.area,
        city: data.city,
        pincode: data.pinCode,
        addressName: data.addressName,
      };

      cust.addressList.push(address);
    }

    return this.http.post(this.registerCustomerUrl, cust, {
      responseType: 'text',
    });
  }
}
