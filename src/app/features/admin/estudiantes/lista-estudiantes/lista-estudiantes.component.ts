import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { Estudiante } from '../../../../core/models/estudiante.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EstadoBadgePipe } from '../../../../shared/pipes/estado-badge.pipe';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-lista-estudiantes',
  standalone: true,
  imports: [RouterLink, NavbarComponent, ConfirmDialogComponent, EstadoBadgePipe, TableModule, ButtonModule, TagModule, ToastModule, ProgressSpinnerModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './lista-estudiantes.component.html'
})
export class ListaEstudiantesComponent implements OnInit {
  private readonly estudianteService = inject(EstudianteService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(true);
  readonly estudiantes = signal<Estudiante[]>([]);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.estudianteService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.estudiantes.set(res.data); },
      complete: () => this.loading.set(false)
    });
  }

  confirmarEliminar(e: Estudiante): void {
    this.confirmationService.confirm({
      message: `¿Eliminar al estudiante "${e.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.estudianteService.delete(e.estudianteId).subscribe({
          next: res => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estudiante eliminado' });
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
