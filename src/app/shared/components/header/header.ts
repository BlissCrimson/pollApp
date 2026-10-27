import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

/** Page header with logo and navigation */
@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private router = inject(Router);

  // The single survey page uses the light header (dark logo + create button)
  isLight = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/survey-display')),
    ),
    { initialValue: this.router.url.startsWith('/survey-display') },
  );

  /** Navigates to the home page and asks it to open the create dialog */
  goToCreateSurvey(): void {
    this.router.navigate(['/'], { queryParams: { create: 1 } });
  }
}
