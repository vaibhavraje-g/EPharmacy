import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../shared/services/register-service/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  stateList: string[] = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu Kashmir', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttarakhand', 'Uttar Pradesh', 'West Bengal'
  ];

  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private RegisterService: RegisterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      fullName: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z]+(?: [a-zA-Z]+)*$')]
      ],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      dob: ['', [Validators.required, this.ageValidator]],
      mobile: ['', [Validators.required, Validators.pattern('^[6-9]{1}[0-9]{9}$')]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(20),
          Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{7,20}')
        ]
      ],
      addressName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      area: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ageValidator(control: any) {
    const dob = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const month = today.getMonth() - dob.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
      return { ageInvalid: true };
    }
    return age < 18 ? { ageBelow18: true } : null;
  }

  passwordValid(condition: string): boolean {
    const password = this.registerForm.get('password')?.value;
    switch (condition) {
      case 'uppercase':
        return /[A-Z]/.test(password);
      case 'lowercase':
        return /[a-z]/.test(password);
      case 'digit':
        return /\d/.test(password);
      case 'special':
        return /[@$!%*?&]/.test(password);
      case 'length':
        return password?.length >= 7 && password?.length <= 20;
      default:
        return false;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required.';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid format.';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (control?.hasError('minlength') || control?.hasError('maxlength')) {
      return 'Password must be between 7 to 20 characters long.';
    }
    if (control?.hasError('ageBelow18')) {
      return 'You must be 18 years or older to register.';
    }
    if (control?.hasError('ageInvalid')) {
      return 'Date of birth cannot be a future date.';
    }
    return '';
  }

  registerCustomer() {
    if (this.registerForm) {
      this.RegisterService.registerCustomer(this.registerForm.value).subscribe(
        (response) => {
          console.log('Registration successful', response);
          this.router.navigate(['/', 'login']);
        },
        (errorResponse) => {
          console.log('Registration failed', errorResponse);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }
}
