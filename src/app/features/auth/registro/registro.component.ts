import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ProgramaCreditoService } from '../../../core/services/programa-credito.service';
import { ProgramaCredito } from '../../../core/models/materia.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, CardModule, MessageModule, SelectModule],
  templateUrl: './registro.component.html'
})
export class RegistroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly programaService = inject(ProgramaCreditoService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly programas = signal<ProgramaCredito[]>([]);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    programaCreditoId: [0, [Validators.required, Validators.min(1)]],
    nombreUsuario: ['', Validators.required],
    contrasena: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.programaService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.programas.set(res.data); }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    this.authService.registro(this.form.getRawValue()).subscribe({
      next: res => {
        if (res.success) {
          this.successMsg.set('Registro exitoso. Redirigiendo...');
          setTimeout(() => this.router.navigate(['/inicio']), 1500);
        } else {
          this.errorMsg.set(res.error?.message ?? 'Error al registrarse');
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
