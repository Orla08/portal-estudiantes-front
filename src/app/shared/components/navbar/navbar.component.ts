import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, MenubarModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.menuItems = [
      { label: 'Inicio', icon: 'pi pi-home', routerLink: '/inicio' }
    ];

    if (!this.authService.isAdmin()) {
      this.menuItems.push({ label: 'Mi Inscripción', icon: 'pi pi-book', routerLink: '/inscripcion' });
    }

    if (this.authService.isAdmin()) {
      this.menuItems.push({
        label: 'Administración',
        icon: 'pi pi-cog',
        items: [
          { label: 'Estudiantes', icon: 'pi pi-users', routerLink: '/admin/estudiantes' },
          { label: 'Materias', icon: 'pi pi-book', routerLink: '/admin/materias' },
          { label: 'Profesores', icon: 'pi pi-user', routerLink: '/admin/profesores' },
          { label: 'Programas', icon: 'pi pi-graduation-cap', routerLink: '/admin/programas' },
          { label: 'Usuarios', icon: 'pi pi-key', routerLink: '/admin/usuarios' }
        ]
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
