import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { errorMessage } from '../../core/models/api-error.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly hidePassword = signal(true);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/tickets']),
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(
          err instanceof HttpErrorResponse && err.status === 401
            ? 'Credenziali non valide: controlla username e password'
            : errorMessage(err),
        );
      },
    });
  }
}
