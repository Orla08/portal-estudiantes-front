import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfesorService } from '../../../core/services/profesor.service';
import { Profesor } from '../../../core/models/materia.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [RouterLink, NavbarComponent, ConfirmDialogComponent, ReactiveFormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule, ProgressSpinnerModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './profesores.component.html'
})
export class ProfesoresComponent implements OnInit {
  private readonly profesorService = inject(ProfesorService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly guardando = signal(false);
  readonly profesores = signal<Profesor[]>([]);
  dialogVisible = false;
  editando = false;
  private editandoId = 0;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required]
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.profesorService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.profesores.set(res.data); },
      complete: () => this.loading.set(false)
    });
  }

  abrirDialog(p?: Profesor): void {
    this.editando = !!p;
    this.editandoId = p?.profesorId ?? 0;
    this.form.reset({ nombre: p?.nombre ?? '' });
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
      this.profesorService.update(this.editandoId, value).subscribe({ next: done, error: onError });
    } else {
      this.profesorService.create(value).subscribe({ next: done, error: onError });
    }
  }
}
