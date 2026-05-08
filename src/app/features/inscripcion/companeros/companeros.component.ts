import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { CompaneroMateria } from '../../../core/models/inscripcion.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-companeros',
  standalone: true,
  imports: [RouterLink, NavbarComponent, TableModule, ProgressSpinnerModule],
  templateUrl: './companeros.component.html'
})
export class CompanerosComponent implements OnInit {
  private readonly inscripcionService = inject(InscripcionService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly companeros = signal<CompaneroMateria[]>([]);

  ngOnInit(): void {
    const id = this.authService.estudianteId();
    if (!id) return;
    this.inscripcionService.getCompaneros(id).subscribe({
      next: res => { if (res.success && res.data) this.companeros.set(res.data); },
      complete: () => this.loading.set(false)
    });
  }
}
