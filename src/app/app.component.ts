import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatToolbarModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
// Delegamos en AuthService: borra sesión y navega a /login.

export class AppComponent {
  title = 'Innclod Manager';
  constructor(public auth: AuthService) {}
  logout(): void { this.auth.logout(); }
}
