import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: ':host { display: block; height: 100%; }',
})
export class App {
  constructor() {
    // Usa il font "Material Symbols Outlined" caricato in index.html
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
  }
}
