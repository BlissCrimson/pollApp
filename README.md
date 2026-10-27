# PollApp

PollApp is an Angular app to create, share and evaluate surveys in real time. Supabase is used for data and anonymous authentication.

## Setup

1. Copy `src/environments/environment.example.ts` to `src/environments/environment.ts` and enter your Supabase URL and anon key.
2. Supabase needs the tables `groups`, `questions`, `answers` and `votes` (linked by foreign keys), RLS policies for them, and Realtime enabled for `votes`.
3. Enable anonymous sign-ins in Supabase (Authentication settings); every visitor votes as an anonymous user.

## Extras

- Live results: the result view updates in real time via Supabase Realtime (debounced, because one vote can insert several rows).
- Active and past surveys are separate views; past surveys can be opened but not voted on.
- Creating a survey is rolled back if saving questions or answers fails.
- Questions can allow single or multiple answers.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
