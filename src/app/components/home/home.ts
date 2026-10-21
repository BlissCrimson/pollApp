import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private router = inject(Router);

  // Navigate to the create survey page
  goToCreateSurvey() {
    this.router.navigate(['/create-survey']);
  }
}
