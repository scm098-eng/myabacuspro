# Preview Project Workflow

This workflow describes how to launch the Next.js development server to preview and test changes in a local browser environment.

## Prerequisites
- Successful build or dependency installation (`npm install`)
- Windows OS (PowerShell / cmd execution)

## Step 1: Start Preview Server
Launch the development server with Turbopack on port 9002 (as configured in `package.json`):
```bash
npm run dev
```
*(On Windows systems where PowerShell ExecutionPolicy blocks script execution, prepend with `cmd /c "npm run dev"`)*

## Step 2: Open Preview in Browser
Open the following local URL in your web browser:
- Local: http://localhost:9002
