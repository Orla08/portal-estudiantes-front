import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MateriaService } from '../../../core/services/materia.service';
import { ProfesorService } from '../../../core/services/profesor.service';
import { ProgramaCreditoService } from '../../../core/services/programa-credito.service';
import { Materia, Profesor, ProgramaCredito } from '../../../core/models/materia.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EstadoBadgePipe } from '../../../shared/pipes/estado-badge.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [RouterLink, NavbarComponent, ConfirmDialogComponent, EstadoBadgePipe, ReactiveFormsModule, TableModule, ButtonModule, TagModule, DialogModule, InputTextModule, InputNumberModule, SelectModule, ToastModule, ProgressSpinnerModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './materias.component.html'
})
export class MateriasComponent implements OnInit {
  private readonly materiaService = inject(MateriaService);
  private readonly profesorService = inject(ProfesorService);
  private readonly programaService = inject(ProgramaCreditoService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly guardando = signal(false);
  readonly materias = signal<Materia[]>([]);
  readonly profesores = signal<Profesor[]>([]);
  readonly programas = signal<ProgramaCredito[]>([]);
  dialogVisible = false;
  editando = false;
  private editandoId = 0;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    creditos: [3, [Validators.required, Validators.min(1)]],
    profesorId: [0, Validators.required],
    programaCreditoId: [0, Validators.required]
  });

  ngOnInit(): void {
    this.cargar();
    this.profesorService.getAll().subscribe({ next: res => { if (res.success && res.data) this.profesores.set(res.data); } });
    this.programaService.getAll().subscribe({ next: res => { if (res.success && res.data) this.programas.set(res.data); } });
  }

  cargar(): void {
    this.loading.set(true);
    this.materiaService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.materias.set(res.data); },
      complete: () => this.loading.set(false)
    });
  }

  abrirDialog(m?: Materia): void {
    this.editando = !!m;
    this.editandoId = m?.materiaId ?? 0;
    this.form.reset({ nombre: m?.nombre ?? '', creditos: m?.creditos ?? 3, profesorId: (m as any)?.profesorId ?? 0, programaCreditoId: (m as any)?.programaCreditoId ?? 0 });
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
      this.materiaService.update(this.editandoId, value).subscribe({ next: done, error: onError });
    } else {
      this.materiaService.create(value).subscribe({ next: done, error: onError });
    }
  }

  confirmarEliminar(m: Materia): void {
    this.confirmationService.confirm({
      message: `¿Eliminar materia "${m.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.materiaService.delete(m.materiaId).subscribe({
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
