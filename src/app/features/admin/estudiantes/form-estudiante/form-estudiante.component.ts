import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { ProgramaCreditoService } from '../../../../core/services/programa-credito.service';
import { ProgramaCredito } from '../../../../core/models/materia.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../../../../core/utils/api-response.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-form-estudiante',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, ButtonModule, InputTextModule, CardModule, MessageModule, ToastModule, SelectModule],
  providers: [MessageService],
  templateUrl: './form-estudiante.component.html'
})
export class FormEstudianteComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly estudianteService = inject(EstudianteService);
  private readonly programaService = inject(ProgramaCreditoService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);
  readonly esEdicion = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly programas = signal<ProgramaCredito[]>([]);
  private estudianteId = 0;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    programaCreditoId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.programaService.getAll().subscribe({
      next: res => { if (res.success && res.data) this.programas.set(res.data); }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.estudianteId = +id;
      this.estudianteService.getById(+id).subscribe({
        next: res => { if (res.success && res.data) this.form.patchValue(res.data); }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    const value = this.form.getRawValue();

    const handleResult = (res: ApiResponse<unknown>) => {
      if (res.success) {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: this.esEdicion() ? 'Actualizado' : 'Creado' });
        setTimeout(() => this.router.navigate(['/admin/estudiantes']), 1000);
      } else {
        this.errorMsg.set(res.error?.message ?? 'Error');
        this.loading.set(false);
      }
    };

    const handleError = (err: HttpErrorResponse) => {
      this.errorMsg.set(err.error?.error?.message ?? err.error?.message ?? 'Error de conexión');
      this.loading.set(false);
    };

    if (this.esEdicion()) {
      this.estudianteService.update(this.estudianteId, value).subscribe({ next: handleResult, error: handleError });
    } else {
      this.estudianteService.create(value).subscribe({ next: handleResult, error: handleError });
    }
  }
}
