import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth-service/auth.service';
import { LoginService } from '../../shared/services/login-service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = "";

  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    });
  }

  customerLogin(): void {
    this.loginService.loginCustomer(this.loginForm.value).subscribe(
      response => {
        const customerData = response.data;
        this.auth.nextCustomer(customerData);
        sessionStorage.setItem("customerId", `${customerData.customerId}`);
        sessionStorage.setItem("customerName", customerData.customerName);
        sessionStorage.setItem("customerEmailId", customerData.customerEmailId);
        this.router.navigate(['/medicine']);
      },
      errorResponse => {
        this.errorMessage = errorResponse.error.message;
        sessionStorage.clear();
      }
    );
  }

  getRegisterPage(): void {
    this.router.navigate(['/', 'register']);
  }
}
