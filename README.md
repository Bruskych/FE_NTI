<div align="center">

# NTI ```Frontend```
### Nitriansky technologický inkubátor

Interactive web application for students, companies, and mentors in the NTI ecosystem.

The frontend provides a single-page interface for managing applications, programs, teams, mentoring, and project workflows inside the NTI platform.

```It includes:```
* public website with program information
* user dashboard (students, companies, mentors)
* application and registration system
* project and team management
* admin interface for content and workflow control

🤖 [Backend Repository](https://github.com/Bruskych/BE_NTI) · 🎨 [Frontend Repository](https://github.com/Bruskych/FE_NTI)

[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Nuxt.js](https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white)](https://postcss.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

</div>

---

### Tech Stack & Tools
* **Core Framework:** Vue 3 Composition API & TypeScript
* **State Management:** Pinia (Modular stores for auth, documents, projects)
* **HTTP Client:** Axios / Nuxt Fetch (Integrated interceptors for Bearer tokens)
* **Styling & UI:** Tailwind CSS (Responsive layouts with support for dark and light modes, as well as English and Slovak languages)
* **Dev Environment:** Docker Containerization (Node 20 Alpine base)

---

### 📥 1. Quick Start

```Clones the repository``` with the frontend code from GitHub to your local computer. The command must be executed in an empty folder where you want to see your project.
```bash
git clone https://github.com/Bruskych/FE_NTI
```

You need to go inside the ```project folder```
```bash
cd YOUR_PROJECT_FOLDER_NAME
```

---

### 🐳 2. Start Containers

Choose one of the two development workflows below depending on whether you need a fully functional backend API or just want to work on isolated UI/styling.

#### 🔹 Option A: Full-Stack Workflow (With Backend API)

Use this if you want a fully functional application with working authentication, forms, and database features.*

1. Ensure your ```backend containers``` are already running. If not, navigate to the backend repository root and spin them up:
```bash
docker compose up -d --build
```

2. Return to this frontend repository directory ```(FE_NTI)``` and start the Nuxt app:
```bash
docker compose up -d --build
```

#### 🔹 Option B: Isolated Frontend Workflow (Without Backend)

Use this if you only need to modify UI layouts, Tailwind styles, or static components without spinning up the backend.

Since the frontend Docker setup expects an external bridge network (nti-network), running compose directly will fail. You must manually create the shared network layer once before building the container:

1. Create the missing docker network manually
```bash
docker network create nti-network
```

2. Build and start the frontend container
```bash
docker compose up -d --build
```

📌 Note: The UI will load at http://localhost:3000, but API requests (login, forms, data fetching) will fail with AxiosError / Connection Refused until the backend is running.

---

### ⚙️ Service Architecture & Ports

All services running inside the Docker network are pre-configured. You can access them via the following local URLs:

| Service | 🌐 Context / UI URL                | Internal Port | External Port |
|---|------------------------------------|---------------|---------------|
| Frontend (Local) | http://localhost:3000              | 3000          | 3000          |
| Frontend (Production) | https://bruskych.github.io/FE_NTI/ | —             | —         |

---

### Project Structure

```
src/
├── assets/                  # GLOBAL STYLES & THEMES
│   └── [style].css          # Color tokens, typography configs, and core theme layout rules
│
├── components/              # REUSABLE UI COMPONENTS
│   └── [Component].vue      # Layout structures, atomic UI elements, wrappers, and custom input fields
│
├── composables/             # STATELESS REUSABLE HOOKS
│   └── use[Logic].ts        # Vue composition functions (e.g., reactive dark mode toggles, runtime i18n)
│
├── core/                    # NETWORK & ROUTING CORE
│   ├── axios.ts             # Axios client instances configured with credentials and interceptors
│   └── router.ts            # Vue Router definitions mapping endpoints to static/dynamic view components
│
├── locales/                 # LOCALIZATION DICTIONARIES
│   └── [en|sk].json         # Translation files providing multi-language support (English / Slovak)
│
├── stores/                  # PINIA STATE MANAGEMENT (API Proxies)
│   └── [domain]Store.ts     # Global states communicating with Laravel backend using Axios HTTP methods
│
├── types/                   # GLOBAL TS DECLARATIONS
│   └── [name].d.ts          # TypeScript modules extending global Vue interfaces, SVGs, and Vite Env bindings
│
├── utils/                   # HARDWARE & STORAGE UTILITIES
│   └── cookie.ts            # Client-side helper scripts handling cookie storage lifecycle (e.g., token caches)
│
├── views/                   # PAGE COMPONENT VIEWPORTS
│   └── [Page]View.vue       # Top-level page interfaces hooked directly to target router configurations
│
├── App.vue                  # APP APPLICATION SHELL
│   └── App.vue              # Entrypoint wrapper orchestrating component render pipelines and themes
│
└── main.ts                  # REACTION BOOTSTRAPPER - System initializer mounting Vue instance, Pinia store matrix, UI plugins          
```

---

## 📋 Project Documentation (NTI Platform Specification)

This section covers the core business, architectural, and operational framework of the Nitriansky technologický inkubátor (NTI) central system, aligning with the academic and technical requirements.

### 1. Executive Summary
* **Problem:** Brain drain of technological talent from the Nitra region and a lack of structured, real-world practical experience for IT students during their studies.
* **Solution:** NTI is a centralized web information system that bridges the gap between academia and the private sector. It provides a presentation portal, handles application workflows for grant incubation (Program A), and manages real-world company-assigned projects (Program B).
* **Market & Impact:** The platform serves university students, regional IT companies, mentors, and the NTI administration, driving regional retention of tech talent and accelerating new tech startups.

### 2. Technical Architecture Overview
The NTI platform is currently implemented using a **Layered Monolith** architecture, leveraging the native, battle-tested structure of the Laravel framework. To prevent the codebase from turning into a "big ball of mud," the system heavily relies on the **Service-Action Pattern**, establishing a solid foundation for future scalability.

* **Current Architecture (Layered Monolith):** The codebase is separated by technical concerns (`Controllers`, `Actions`, `Services`, `Models`, `Requests`, ...). Instead of bloating controllers, all core business logic is encapsulated into isolated, single-responsibility classes inside `app/Actions` and `app/Services`. This ensures loose coupling, strict testability, and clear separation of duties.
* **Future Architectural Evolution (Target: Modular Monolith):** As the platform scales beyond the initial MVP phase (Phase 2 & 3), the codebase is prepared to transition into a strict **Modular Monolith**. Because the business logic is already isolated within independent `Actions` and `Services`, they can be easily refactored into self-contained domain modules (e.g., `app/Modules/Auth`, `app/Modules/Programs`, `app/Modules/Evaluations`) without breaking the core infrastructure. This architecture ensures low operational complexity for university hosting while keeping the system ready for future microservices extraction if required.
* **Frontend:** Vue.js + TypeScript (Responsive SPA tailored for different user roles).
* **Backend:** Laravel 13 (PHP 8.4) exposing a secure REST API documented via OpenAPI/Swagger.
* **Database & Cache:** MySQL 8 for robust relational integrity (audit logs, application tracking) and Redis for high-performance background queueing (notifications, rate-limiting).
* **Infrastructure:** Containerized environment via Docker Compose and Nginx reverse proxy.

### 3. Project Roadmap
The implementation is divided into four strategic phases to ensure an expandable MVP:
* **Phase 0 (Discovery & UX/IA):** Process refinement, user role definition, wireframing, and branding rules.
* **Phase 1 (MVP Core - Current):** Public web CMS, user authentication, student/team registration, and Program A workflow.
* **Phase 2 (Program B & Workflows):** Company onboarding, project backlog management, mentor assignment, and performance tracking.
* **Phase 3 (BI & Advanced Features):** KPI dashboards, automated reporting, and advanced analytical export layers.

### 4. Budget & Resource Allocation (MVP Estimate)
The estimated initial development and maintenance budget for the NTI platform MVP is structured as follows:

| Category | Allocation / Description | Estimated Cost Model |
| --- | --- | --- |
| **Development** | Backend (Laravel) & Frontend (Vue.js) core architecture | ~350 Engineering Hours |
| **Infrastructure** | Self-hosted university servers or standard cloud VPS setup | Minimal (Open-source friendly) |
| **QA & Security** | Unit/Integration testing & lightweight penetration testing | Internal academic / peer review |

### 5. Risk Analysis & Mitigation
* **Risk 1: Data Leaks & GDPR Violations (High Impact).** The system stores sensitive academic records and company contract details.
    * *Mitigation:* Strict Role-Based Access Control (RBAC) via Spatie, password hashing using Argon2id, and comprehensive automated audit logging for all admin actions.
* **Risk 2: High System Load During Deadlines (Medium Impact).** Massive traffic spikes when application call deadlines approach.
    * *Mitigation:* Redis rate-limiting on forms, client-side draft autosaving, and shifting heavy email notifications to asynchronous background queues (`nti-queue`).
* **Risk 3: Malicious File Uploads (High Impact).** Students upload mandatory PDFs or project documents containing malware.
    * *Mitigation:* Strict server-side MIME-type/extension validation and file size constraints enforced by backend middleware.

### 6. Monetization & Sustainability Model
As an institutional and regional platform, NTI ensures long-term operational sustainability through a hybrid ecosystem model:
* **Program A (Incubation):** Funded by regional development grants, university structural funds, and innovation subsidies.
* **Program B (Live Practice):** B2B partnership model where external companies provide student rewards/budgets. A small administrative percentage can be retained by NTI to cover platform maintenance, server costs, and mentor compensations.

---

## 👨🏽‍💻 Authors

| Name | GitHub                                         |
|---|--------------------------------------------------|
| Vladyslav Svider | [Link to git](https://github.com/Versus1478)     |
| Vladyslav Shcherbyna | [Link to git](https://github.com/Bruskych)       |
| Davyd Shapovalov | [Link to git](https://github.com/davidshapovalov) |