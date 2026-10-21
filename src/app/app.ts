import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [RouterOutlet, Header, Footer, ReactiveFormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('pollApp');


}
