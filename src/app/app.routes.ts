import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { inscripcionGuard } from './core/guards/inscripcion.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('./features/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'inscripcion',
    canActivate: [inscripcionGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/inscripcion/mi-inscripcion/mi-inscripcion.component').then(m => m.MiInscripcionComponent)
      },
      {
        path: 'seleccion',
        loadComponent: () => import('./features/inscripcion/seleccion-materias/seleccion-materias.component').then(m => m.SeleccionMateriasComponent)
      },
      {
        path: 'companeros',
        loadComponent: () => import('./features/inscripcion/companeros/companeros.component').then(m => m.CompanerosComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'estudiantes',
        loadComponent: () => import('./features/admin/estudiantes/lista-estudiantes/lista-estudiantes.component').then(m => m.ListaEstudiantesComponent)
      },
      {
        path: 'estudiantes/nuevo',
        loadComponent: () => import('./features/admin/estudiantes/form-estudiante/form-estudiante.component').then(m => m.FormEstudianteComponent)
      },
      {
        path: 'estudiantes/:id/editar',
        loadComponent: () => import('./features/admin/estudiantes/form-estudiante/form-estudiante.component').then(m => m.FormEstudianteComponent)
      },
      {
        path: 'materias',
        loadComponent: () => import('./features/admin/materias/materias.component').then(m => m.MateriasComponent)
      },
      {
        path: 'profesores',
        loadComponent: () => import('./features/admin/profesores/profesores.component').then(m => m.ProfesoresComponent)
      },
      {
        path: 'programas',
        loadComponent: () => import('./features/admin/programas/programas.component').then(m => m.ProgramasComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/inicio' }
];
