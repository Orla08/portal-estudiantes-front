import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProgramaCreditoService } from '../../../core/services/programa-credito.service';
import { ProgramaCredito } from '../../../core/models/materia.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-programas',
  standalone: true,
  imports: [RouterLink, NavbarComponent, ReactiveFormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './programas.component.html'
})
export class ProgramasComponent implements OnInit {
  private readonly programaService = inject(ProgramaCreditoService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly guardando = signal(false);
  readonly programas = signal<ProgramaCredito[]>([]);
  dialogVisible = false;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    creditosPorMateria: [3, [Validators.required, Validators.min(1)]],
    maxMateriasPorEstudiante: [3, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.programaService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.programas.set(res.data); },
      complete: () => this.loading.set(false)
    });
  }

  abrirDialog(): void {
    this.form.reset({ nombre: '', creditosPorMateria: 3, maxMateriasPorEstudiante: 3 });
    this.dialogVisible = true;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.programaService.create(this.form.getRawValue()).subscribe({
      next: res => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Programa creado' });
          this.dialogVisible = false;
          this.cargar();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error?.message });
        }
        this.guardando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error?.message ?? err.error?.message ?? 'Error de conexión';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        this.guardando.set(false);
      }
    });
  }
}
