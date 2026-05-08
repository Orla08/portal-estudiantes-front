import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EstadoBadgePipe } from '../../../shared/pipes/estado-badge.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterLink, NavbarComponent, ConfirmDialogComponent, EstadoBadgePipe, ReactiveFormsModule, TableModule, ButtonModule, TagModule, DialogModule, InputTextModule, SelectModule, ToastModule, ProgressSpinnerModule, DatePipe],
  providers: [ConfirmationService, MessageService],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly guardando = signal(false);
  readonly usuarios = signal<Usuario[]>([]);
  readonly roles = ['Administrador', 'Estudiante'];
  dialogVisible = false;
  editando = false;
  private editandoId = 0;

  readonly form = this.fb.nonNullable.group({
    nombreUsuario: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contrasena: [''],
    rol: ['Estudiante', Validators.required]
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.usuarioService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.usuarios.set(res.data); },
      complete: () => this.loading.set(false)
    });
  }

  abrirDialog(u?: Usuario): void {
    this.editando = !!u;
    this.editandoId = u?.usuarioId ?? 0;
    this.form.reset({ nombreUsuario: u?.nombreUsuario ?? '', email: u?.email ?? '', contrasena: '', rol: u?.rol ?? 'Estudiante' });
    if (!this.editando) this.form.get('contrasena')?.setValidators([Validators.required, Validators.minLength(6)]);
    else this.form.get('contrasena')?.clearValidators();
    this.form.get('contrasena')?.updateValueAndValidity();
    this.dialogVisible = true;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const value = this.form.getRawValue();
    const done = (res: { success: boolean; error?: { message: string } }) => {
      if (res.success) {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: this.editando ? 'Actualizado' : 'Creado' });
        this.dialogVisible = false;
        this.cargar();
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error?.message });
      }
      this.guardando.set(false);
    };
    const onError = (err: HttpErrorResponse) => {
      const msg = err.error?.error?.message ?? err.error?.message ?? 'Error de conexión';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      this.guardando.set(false);
    };
    if (this.editando) {
      this.usuarioService.update(this.editandoId, { nombreUsuario: value.nombreUsuario, email: value.email, rol: value.rol }).subscribe({ next: done, error: onError });
    } else {
      this.usuarioService.create(value).subscribe({ next: done, error: onError });
    }
  }

  confirmarEliminar(u: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Eliminar al usuario "${u.nombreUsuario}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usuarioService.delete(u.usuarioId).subscribe({
          next: res => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Eliminado' });
              this.cargar();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error?.message });
            }
          },
          error: (err: HttpErrorResponse) => {
            const msg = err.error?.error?.message ?? err.error?.message ?? 'Error de conexión';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
          }
        });
      }
    });
  }
}
