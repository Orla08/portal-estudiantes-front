import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InscripcionService } from './inscripcion.service';
import { environment } from '../../../environments/environment';

// ─── helpers ────────────────────────────────────────────────────────────────

const BASE_URL = `${environment.apiUrl}/estudiantes`;
const ESTUDIANTE_ID = 42;
const MATERIA_ID    = 7;

const INSCRIPCION_URL     = `${BASE_URL}/${ESTUDIANTE_ID}/inscripcion`;
const COMPANEROS_URL      = `${BASE_URL}/${ESTUDIANTE_ID}/companeros`;
const INSCRIPCION_MAT_URL = `${BASE_URL}/${ESTUDIANTE_ID}/inscripcion/${MATERIA_ID}`;

const mockInscripcion = [
  { materiaId: 1, nombreMateria: 'Matemáticas', profesor: 'Prof. A', horario: 'Lunes 08:00' },
  { materiaId: 2, nombreMateria: 'Física',       profesor: 'Prof. B', horario: 'Martes 10:00' },
];

const mockCompaneros = [
  { nombreEstudiante: 'Juan Pérez',  nombreMateria: 'Matemáticas' },
  { nombreEstudiante: 'Ana García',  nombreMateria: 'Física' },
];

// ─── suite ──────────────────────────────────────────────────────────────────

describe('InscripcionService', () => {
  let service:  InscripcionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service  = TestBed.inject(InscripcionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Creación ───────────────────────────────────────────────────────────────

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── getMiInscripcion() ─────────────────────────────────────────────────────

  it('getMiInscripcion() debería hacer GET a la URL correcta', () => {
    service.getMiInscripcion(ESTUDIANTE_ID).subscribe();

    const req = httpMock.expectOne(INSCRIPCION_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockInscripcion });
  });

  it('getMiInscripcion() debería retornar los datos recibidos', () => {
    let result: any;
    service.getMiInscripcion(ESTUDIANTE_ID).subscribe(r => result = r);

    httpMock.expectOne(INSCRIPCION_URL).flush({ success: true, data: mockInscripcion });

    expect(result.success).toBeTrue();
    expect(result.data.length).toBe(2);
    expect(result.data[0].nombreMateria).toBe('Matemáticas');
  });

  it('getMiInscripcion() debería usar el estudianteId correcto en la URL', () => {
    service.getMiInscripcion(99).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/99/inscripcion`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  // ── getCompaneros() ────────────────────────────────────────────────────────

  it('getCompaneros() debería hacer GET a la URL correcta', () => {
    service.getCompaneros(ESTUDIANTE_ID).subscribe();

    const req = httpMock.expectOne(COMPANEROS_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockCompaneros });
  });

  it('getCompaneros() debería retornar la lista de compañeros', () => {
    let result: any;
    service.getCompaneros(ESTUDIANTE_ID).subscribe(r => result = r);

    httpMock.expectOne(COMPANEROS_URL).flush({ success: true, data: mockCompaneros });

    expect(result.data.length).toBe(2);
    expect(result.data[0].nombreEstudiante).toBe('Juan Pérez');
  });

  // ── registrar() ───────────────────────────────────────────────────────────

  it('registrar() debería hacer POST a la URL correcta', () => {
    const request = { materiaIds: [1, 3, 5] };
    service.registrar(ESTUDIANTE_ID, request).subscribe();

    const req = httpMock.expectOne(INSCRIPCION_URL);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: null });
  });

  it('registrar() debería enviar el body con los materiaIds', () => {
    const request = { materiaIds: [1, 3, 5] };
    service.registrar(ESTUDIANTE_ID, request).subscribe();

    const req = httpMock.expectOne(INSCRIPCION_URL);
    expect(req.request.body).toEqual({ materiaIds: [1, 3, 5] });
    req.flush({ success: true, data: null });
  });

  it('registrar() debería funcionar con una sola materia', () => {
    const request = { materiaIds: [2] };
    service.registrar(ESTUDIANTE_ID, request).subscribe();

    const req = httpMock.expectOne(INSCRIPCION_URL);
    expect(req.request.body).toEqual({ materiaIds: [2] });
    req.flush({ success: true, data: null });
  });

  // ── cancelar() ─────────────────────────────────────────────────────────────

  it('cancelar() debería hacer DELETE a la URL correcta', () => {
    service.cancelar(ESTUDIANTE_ID).subscribe();

    const req = httpMock.expectOne(INSCRIPCION_URL);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: null });
  });

  it('cancelar() debería usar el estudianteId correcto en la URL', () => {
    service.cancelar(55).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/55/inscripcion`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: null });
  });

  // ── cancelarPorMateria() ───────────────────────────────────────────────────

  it('cancelarPorMateria() debería hacer DELETE a la URL correcta', () => {
    service.cancelarPorMateria(ESTUDIANTE_ID, MATERIA_ID).subscribe();

    const req = httpMock.expectOne(INSCRIPCION_MAT_URL);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: null });
  });

  it('cancelarPorMateria() debería incluir el materiaId en la URL', () => {
    service.cancelarPorMateria(ESTUDIANTE_ID, 99).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/${ESTUDIANTE_ID}/inscripcion/99`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: null });
  });

  it('cancelarPorMateria() no debería cancelar otras materias (URL específica)', () => {
    let responded = false;
    service.cancelarPorMateria(ESTUDIANTE_ID, MATERIA_ID).subscribe(() => responded = true);

    // Verificar que NO apunta a la URL general de inscripción
    httpMock.expectNone(INSCRIPCION_URL);
    httpMock.expectOne(INSCRIPCION_MAT_URL).flush({ success: true, data: null });

    expect(responded).toBeTrue();
  });
});
