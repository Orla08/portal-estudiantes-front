import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { Inscripcion } from '../../../core/models/inscripcion.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-mi-inscripcion',
  standalone: true,
  imports: [RouterLink, NavbarComponent, ConfirmDialogComponent, TableModule, ButtonModule, TagModule, ToastModule, ProgressSpinnerModule, DatePipe],
  providers: [ConfirmationService, MessageService],
  templateUrl: './mi-inscripcion.component.html'
})
export class MiInscripcionComponent implements OnInit {
  private readonly inscripcionService = inject(InscripcionService);
  private readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(true);
  readonly inscripciones = signal<Inscripcion[]>([]);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    const id = this.authService.estudianteId();
    if (!id) return;
    this.loading.set(true);
    this.inscripcionService.getMiInscripcion(id).subscribe({
      next: res => { if (res.success && res.data) this.inscripciones.set(res.data); },
      complete: () => this.loading.set(false)
    });
  }

  confirmarCancelarMateria(inscripcion: Inscripcion): void {
    this.confirmationService.confirm({
      message: `¿Deseas cancelar la inscripción en <b>${inscripcion.nombreMateria}</b>? Esta acción no se puede deshacer.`,
      header: 'Cancelar Materia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelarMateria(inscripcion)
    });
  }

  confirmarCancelar(): void {
    this.confirmationService.confirm({
      message: '¿Deseas cancelar <b>toda</b> tu inscripción actual? Esta acción no se puede deshacer.',
      header: 'Cancelar Inscripción Completa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar todo',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelar()
    });
  }

  private cancelarMateria(inscripcion: Inscripcion): void {
    const estudianteId = this.authService.estudianteId()!;
    this.inscripcionService.cancelarPorMateria(estudianteId, inscripcion.materiaId).subscribe({
      next: res => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Inscripción en ${inscripcion.nombreMateria} cancelada` });
          this.cargar();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: (res as any).error?.message });
        }
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error?.message ?? err.error?.message ?? 'Error de conexión';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  private cancelar(): void {
    const id = this.authService.estudianteId()!;
    this.inscripcionService.cancelar(id).subscribe({
      next: res => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Inscripción completa cancelada' });
          this.cargar();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: (res as any).error?.message });
        }
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error?.message ?? err.error?.message ?? 'Error de conexión';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }
}
