import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CardModule, ButtonModule, NavbarComponent],
  templateUrl: './inicio.component.html'
})
export class InicioComponent {
  readonly authService = inject(AuthService);
}
