import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { MateriaService } from '../../../core/services/materia.service';
import { Materia } from '../../../core/models/materia.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-seleccion-materias',
  standalone: true,
  imports: [RouterLink, NavbarComponent, TableModule, ButtonModule, TagModule, MessageModule, ToastModule, CheckboxModule, FormsModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './seleccion-materias.component.html'
})
export class SeleccionMateriasComponent implements OnInit {
  private readonly materiaService = inject(MateriaService);
  private readonly inscripcionService = inject(InscripcionService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly guardando = signal(false);
  readonly materias = signal<(Materia & { nombreProfesor: string })[]>([]);
  seleccionadas = signal<number[]>([]);

  ngOnInit(): void {
    this.materiaService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.materias.set(res.data as any); },
      complete: () => this.loading.set(false)
    });
  }

  estaSeleccionada(id: number): boolean {
    return this.seleccionadas().includes(id);
  }

  inscribir(): void {
    const estudianteId = this.authService.estudianteId();
    if (!estudianteId) return;
    this.guardando.set(true);
    this.inscripcionService.registrar(estudianteId, { materiaIds: this.seleccionadas() }).subscribe({
      next: res => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Inscripción registrada' });
          setTimeout(() => this.router.navigate(['/inscripcion']), 1500);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.error?.message });
        }
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error?.message ?? err.error?.message ?? 'Error de conexión';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        this.guardando.set(false);
      },
      complete: () => this.guardando.set(false)
    });
  }
}
