# ERP Frontend Intern Challenge

Welcome to the **ERP Frontend Internship Challenge**.

This repository contains the completed **Inventory Management** module, which serves as the reference implementation for the project's frontend architecture and coding standards.

Your task is to study the Inventory module and build a new **Human Resource (HR)** module by following the same architecture, patterns, and best practices.

---

# Repository

Clone the project:

```bash
git clone https://github.com/etsayhaben/ERP_Frontend_Intern_Challenge.git
```

Navigate into the project:

```bash
cd ERP_Frontend_Intern_Challenge
```

---

# Create Your Working Branch

After cloning the repository, create a new branch for your work.

```bash
git checkout -b feature/human_resource
```

Verify your current branch:

```bash
git branch
```

You should see:

```text
* feature/yourname/human_resource
```

> **Important**
>
> - Do **not** work directly on the `main` branch.
> - All development must be completed in the `feature/human_resource` branch.
> - Commit and push your work only to this branch.

Push the branch to GitHub:

```bash
git push -u origin feature/human_resource
```

---

# Installation

Install all project dependencies:

```bash
npm install
```

---

# Running the Project

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

If everything is configured correctly, the application should start successfully.

---

# Your Challenge

The Inventory module has already been completed.

Your responsibility is to build a new module called:

```
modules/hr
```

using the **same architecture**, **folder structure**, and **coding patterns** as the existing Inventory module.

Do **not** redesign the project structure.

Whenever you are unsure how something should be implemented, refer to the Inventory module.

---

# Learning Objectives

By completing this challenge, you should understand:

- Feature-based project architecture
- API Integration
- React Components
- Custom Hooks
- Local State (`useState`)
- Global State (Zustand)
- TanStack Query
- CRUD Operations
- Form Reuse
- Clean and maintainable code

---

# Project Structure

The project follows a feature-based architecture.

```
src/
│
├── app/
├── modules/
│ ├── inventory/
│ └── hr/ ← Build this module
│
├── shared/
├── providers/
└── styles/
```

Each module should contain a similar structure.

```
modules/hr/

├── api/
├── components/
├── hooks/
├── services/
├── store/
└── types/
```

---

# Folder Responsibilities

## api/

Responsible for communicating with the backend (or mock backend).

Examples:

- Fetch Employees
- Create Employee
- Update Employee
- Delete Employee

---

## components/

Reusable UI components.

Examples:

- EmployeeTable
- EmployeeForm
- EmployeeRow
- SearchBar

---

## hooks/

Reusable frontend logic.

Examples:

- Fetching data
- Searching
- Filtering
- React Query logic

---

## services/

Business rules and validation.

Examples:

- Validate employee information
- Calculate statistics
- Helper functions

---

## store/

Global application state using Zustand.

Use this only when multiple unrelated components need the same data.

Examples:

- Department Filter
- Navbar Badge
- Selected Employees

---

## types/

Shared TypeScript interfaces.

Examples:

- Employee
- EmployeeFormValues

---

# HR Module Requirements

Build an Employee Directory module that allows users to:

- View Employees
- Search Employees
- Filter by Department
- Add Employees
- Edit Employees
- Delete Employees
- Perform Bulk Actions
- Display Employees on Leave in the Navbar

---

# Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | View all employees |
| FR-2 | Search employees by name |
| FR-3 | Filter employees by department |
| FR-4 | Add employee |
| FR-5 | Edit employee |
| FR-6 | Delete employee |
| FR-7 | Bulk employee actions |
| FR-8 | Navbar "Employees on Leave" badge |
| FR-9 | Dashboard reflects the selected department |

---

# Development Guidelines

- Follow the Inventory module architecture.
- Keep pages thin.
- Build reusable components.
- Separate UI from API logic.
- Reuse components whenever possible.
- Keep business logic outside UI components.
- Use TypeScript consistently.
- Write clean, maintainable code.

---

# Before Requesting a Review

Make sure that:

- All CRUD operations work correctly.
- Search and filtering work.
- Global state updates correctly.
- Components are reusable.
- No TypeScript errors.
- No ESLint errors.
- No browser console errors.
- Your code has been committed to the **feature/human_resource** branch.
- Your latest changes have been pushed to GitHub.

---

# Submission

When you have completed the challenge:

1. Commit all your changes.

```bash
git add .
git commit -m "Complete HR module"
```

2. Push your work.

```bash
git push origin feature/human_resource
```

3. Share your GitHub repository or create a Pull Request for review.

---

# Success Criteria

By the end of this challenge, you should be able to explain:

- Why the project is organized by modules.
- When to use Components.
- When to use Hooks.
- When to use Services.
- When to use Zustand.
- When to use Local State.
- How the frontend communicates with the backend.
- How to build scalable ERP frontend features using the project's architecture.

Good luck, and enjoy building the HR module!
