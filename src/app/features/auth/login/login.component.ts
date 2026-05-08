import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, CardModule, MessageModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombreUsuario: ['', Validators.required],
    contrasena: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    const { nombreUsuario, contrasena } = this.form.getRawValue();
    this.authService.login({ nombreUsuario, contrasena }).subscribe({
      next: res => {
        if (res.success) {
          this.loading.set(false);
          this.router.navigate(['/inicio']);
        } else {
          this.errorMsg.set(res.error?.message ?? 'Error al iniciar sesión');
          this.loading.set(false);
        }
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error?.message ?? err.error?.message ?? 'Error de conexión. Intente nuevamente.';
        this.errorMsg.set(msg);
        this.loading.set(false);
      }
    });
  }
}
