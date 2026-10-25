import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SurveyDisplay } from './pages/survey-display/survey-display';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'survey-display/:groups_id', component: SurveyDisplay },
];
