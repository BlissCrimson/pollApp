import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CreateSurvey } from './pages/create-survey/create-survey';
import { SurveyDisplay } from './pages/survey-display/survey-display';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'create-survey', component: CreateSurvey },
  { path: 'survey-display/:group_id', component: SurveyDisplay },
];
