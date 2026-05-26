# MediPulse - Healthcare & Data Analytics System
A highly functional, premium-designed Hospital Management and Data Analytics System mini-project built for college demonstrations. The application runs completely on localhost with cross-platform connection safeguards (dynamic local mock backup mode).

---

## 🌟 Features Overview

1. **Secure Admin Authentication**
   - Elegant login card interface with responsive state shifts.
   - Dual-options: Direct sign-in using DBMS defaults or register secondary admins.
   - Password security hashing.

2. **Analytics Control Center (Dashboard)**
   - High-fidelity visual metrics using Recharts.
   - KPI Widgets showing exact Patient, Staff, and Appointment records count.
   - Patient blood group census bar chart (multi-color dynamic gradients).
   - Demographic gender split distribution doughnut pie chart.
   - Visually rich recent appointment logs table with status tracking tags.

3. **Patient Records Management (CRUD)**
   - Add new patients with validations (Name, Age, Gender, Blood Group, Phone, Address).
   - Dynamic patient database grid list with instant live filters and searching.
   - Edit, update, or remove patient listings from database.

4. **Doctor Staff Management (CRUD)**
   - Maintain records for medical personnel (Name, Specialty, Department, Contact).
   - Dynamic indexing with specific clinical department grouping options.
   - Full CRUD options with relational data integrations.

5. **Appointment Scheduler & Registry**
   - Book patient visits with assigned specialist physicians.
   - Relational bindings: Selector dropdowns feed directly from the active Patient and Doctor lists (guaranteeing database integrity).
   - Date and time scheduling selectors.
   - Clean cancel/delete appointment commands.

---

## 🛠️ Technology Stack

- **Frontend Core**: React.js 18 (Vite, TypeScript 5)
- **Styling**: Tailwind CSS 3 (utility classes, premium glassmorphism, responsive grids)
- **Icons**: Lucide React
- **Charts Engine**: Recharts
- **Backend API**: Flask 3 (Python)
- **ORM & DB Connector**: Flask-SQLAlchemy + PyMySQL
- **Database Engine**: MySQL 5.7+ / 8.0+

---

## 📁 Clean Directory Structure

```
dbms/
├── database/
│   └── schema.sql             # SQL Schema & rich dummy dataset
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py        # Credentials check & admin registration
│   │   │   ├── patients.py    # Patients CRUD operations
│   │   │   ├── doctors.py     # Doctors CRUD operations
│   │   │   └── appointments.py# Appointments CRUD operations
│   │   ├── __init__.py        # Flask app creation & blueprint configs
│   │   ├── config.py          # Port & Database connection URL config
│   │   └── models.py          # SQLAlchemy Models (Admin, Patient, Doctor, Appointment)
│   ├── requirements.txt       # Flask python packages
│   └── run.py                 # Backend server executable entrypoint
└── frontend/
    ├── src/
    │   ├── components/        # Login, Dashboard, Patient, Doctor, Appt components
    │   ├── App.tsx            # Main shell with navigation & connection-status
    │   ├── main.tsx           # React bootstrap entrypoint
    │   └── style.css          # Tailwind imports & custom scrollbar styling
    ├── index.html             # Document metadata & premium Inter/Outfit fonts
    ├── package.json           # Frontend npm dependencies
    ├── postcss.config.js      # PostCSS configurations
    ├── tailwind.config.js     # Tailwind compilation targets
    ├── tsconfig.json          # TypeScript configurations
    └── vite.config.ts         # Vite bundler configurations
```

---

## 🚀 Setup & Launch Instructions (Localhost)

### Phase 1: Database Setup (MySQL)
1. Launch your MySQL Command Line Client or open your database manager (e.g. phpMyAdmin, XAMPP, or MySQL Workbench).
2. Execute the schema queries to create the database and seed the dummy data:
   ```sql
   SOURCE database/schema.sql;
   ```
   *Alternative*: Copy the entire content of [database/schema.sql](database/schema.sql) and execute it inside your database SQL query window.
3. Open `backend/app/config.py` and adjust the connection URI credentials:
   ```python
   # mysql+pymysql://<user>:<password>@localhost/<db_name>
   SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/hospital_db'
   ```

---

### Phase 2: Backend API Execution (Flask)
1. Navigate to the `backend` directory using your terminal:
   ```bash
   cd backend
   ```
2. Create a virtual environment (highly recommended for clean python dependency management):
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (Command Prompt)**: `venv\Scripts\activate`
   - **Windows (PowerShell)**: `.\venv\Scripts\activate`
   - **macOS / Linux**: `source venv/bin/activate`
4. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the Flask development server:
   ```bash
   python run.py
   ```
   *The Flask API is now running on `http://localhost:5000`*.

---

### Phase 3: Frontend Interface Execution (React + Vite)
1. Navigate to the `frontend` directory in a new terminal window:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Boot up the Vite preview client:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the printed address (default is `http://localhost:5173`).

---

## 🔐 Credentials Demo Tip

Use the standard pre-configured administrator account details:
- **Username**: `admin`
- **Password**: `admin123`

---

## ⚡ API Endpoint Routes Documentation

- **Auth Blueprints (`/api/auth`)**:
  - `POST /login` : Verify credentials. Returns admin model.
  - `POST /register` : Add new admin user.
- **Patients Blueprints (`/api/patients`)**:
  - `GET /` : Retrieve list of all patient rows.
  - `GET /<id>` : Find a single patient details.
  - `POST /` : Add a patient.
  - `PUT /<id>` : Update details for a patient.
  - `DELETE /<id>` : Remove patient records from database.
- **Doctors Blueprints (`/api/doctors`)**:
  - `GET /` : Search full list of doctors.
  - `POST /` : Register new doctor profile.
  - `PUT /<id>` : Update doctor specialties or departments.
  - `DELETE /<id>` : Delete doctor profile.
- **Appointments Blueprints (`/api/appointments`)**:
  - `GET /` : Query list of booked slots.
  - `POST /` : Book a scheduled visit.
  - `DELETE /<id>` : Cancel appointment slot.
