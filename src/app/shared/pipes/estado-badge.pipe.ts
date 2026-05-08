import { Pipe, PipeTransform } from '@angular/core';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Pipe({ name: 'estadoBadge', standalone: true })
export class EstadoBadgePipe implements PipeTransform {
  transform(estado: boolean): Severity {
    return estado ? 'info' : 'danger';
  }
}
