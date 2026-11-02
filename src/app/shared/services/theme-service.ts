import { Service, signal } from '@angular/core';

@Service()
export class ThemeService {
  savedTheme = signal('');
  previewTheme = signal('');

  preview() {
    this.savedTheme.set(this.previewTheme());
  }

  save() {}

  cancel() {}
}
