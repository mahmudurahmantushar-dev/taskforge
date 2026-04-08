import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private apiService: ApiService, private router: Router) {}

  onRegister() {
    this.loading = true;
    this.error = '';

    this.apiService.register({ name: this.name, email: this.email, password: this.password })
      .subscribe({
        next: () => {
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed';
          this.loading = false;
        },
        complete: () => this.loading = false
      });
  }
} 