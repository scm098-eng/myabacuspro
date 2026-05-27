# Build Project Workflow

This workflow provides a step-by-step guide to installing dependencies and building the Next.js application.

## Prerequisites
- Node.js >= 20.x.x (verified `v22.18.0` is active)
- Windows OS (PowerShell / cmd execution)

## Step 1: Install Dependencies
To install all required npm packages, run:
```bash
npm install
```
*(On Windows systems where PowerShell ExecutionPolicy blocks script execution, prepend with `cmd /c`)*

## Step 2: Typecheck Code
Run TypeScript verification to check types across the application:
```bash
npm run typecheck
```
*(Runs `tsc --noEmit` as defined in `package.json`)*

## Step 3: Build Web Application
Compile and build the Next.js project for production:
```bash
npm run build
```
*(Runs `next build`)*
