# CRIMEINSIGHT - FULL PROJECT DOCUMENTATION

## 1. Project Title
CrimeInsight: Crime Management and Analysis System

---

## 2. Problem Statement
Law enforcement agencies often manage crime-related information across separate records such as criminal profiles, crime reports, victim details, patrol assignments, police station data, and court case files. When this information is scattered, it becomes difficult to track criminals, analyze crime patterns, identify high-risk locations, and manage investigations efficiently.

CrimeInsight addresses this problem by organizing crime-related data into a centralized system. The project is designed to help police departments manage crime records, track criminals and victims, monitor patrol units, analyze hotspot areas, and follow court case progress. This improves data accessibility, investigation tracking, and operational decision-making.

---

## 3. Objectives of the Project
- To store crime and criminal data in a structured database
- To track criminals and victims involved in crimes
- To identify high-risk crime locations
- To manage patrol units assigned to locations
- To track court cases and hearing dates
- To analyze crime data using SQL queries
- To support police decision-making and investigation workflows

---

## 4. Modules in the Project
- Person Module: Stores details of all persons
- Criminal Module: Stores criminal-specific details
- Victim Module: Stores victim-specific details
- Crime Module: Stores crime details
- Crime Record Module: Links criminals and crimes
- Location Module: Stores crime location data
- Patrol Module: Stores patrol unit assignments
- Police Station Module: Stores station details
- Court Case Module: Stores legal case information
- Officer Module: Stores login credentials and roles

---

## 5. Database Tables
- `PERSON`: Stores all people
- `CRIMINAL`: Stores criminal details
- `VICTIM`: Stores victim details
- `CRIME`: Stores crime details
- `CRIME_RECORD`: Stores the criminal-to-crime relationship
- `CRIME_VICTIM`: Stores the crime-to-victim relationship
- `LOCATION`: Stores crime locations
- `PATROL`: Stores patrol units
- `PATROL_DISPATCH`: Stores active crime assignments for patrol units
- `POLICE_STATION`: Stores police station details
- `COURT_CASE`: Stores court case details
- `OFFICER`: Stores login details

---

## 6. Relationships
- `PERSON -> CRIMINAL` (One-to-One)
- `PERSON -> VICTIM` (One-to-One)
- `CRIMINAL -> CRIME` (Many-to-Many via `CRIME_RECORD`)
- `CRIME -> VICTIM` (Many-to-Many via `CRIME_VICTIM`)
- `CRIME -> LOCATION` (Many-to-One)
- `PATROL -> LOCATION` (Many-to-One)
- `PATROL -> CRIME` (One-to-One active assignment via `PATROL_DISPATCH`)
- `POLICE_STATION -> LOCATION` (One-to-One)
- `CRIME -> COURT_CASE` (One-to-Many)

---

## 7. Key Features of the System
- Crime Management: Add and track crimes
- Criminal Management: Maintain criminal profiles and risk levels
- Victim Management: Store and link victim details
- Location Risk Analysis: Identify higher-risk areas using location data
- Patrol Management: Assign patrol units to locations
- Court Case Tracking: Track hearing dates and verdicts
- Dashboard: Display crimes, cases, patrols, and alerts in the frontend
- Hearing Reminder: Show upcoming hearing reminders in the frontend UI
- Officer Authentication: Role-based login for admin, officer, and investigator users

---

## 8. Technologies Used
- Frontend: React + TypeScript
- Build Tool: Vite
- UI Library: shadcn/ui + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL
- IDE: VS Code
- Database Tool: MySQL Workbench

---

## 9. SQL Concepts Used
- Constraints: Primary keys, foreign keys, unique constraints, and enums
- Aggregate logic: Used for analysis and reporting
- Joins: Used to combine related tables
- Views: Used to simplify repeated reporting queries
- Triggers: Used for automatic validation
- Cursors: Used for row-by-row processing in a stored procedure

Additional concepts such as subqueries and set operations can be added for more advanced reporting queries if needed.

---

## 10. System Workflow
Person details are first stored in the `PERSON` table. A person can then be categorized as either a criminal in the `CRIMINAL` table or a victim in the `VICTIM` table.

When a crime occurs, the details are stored in the `CRIME` table and linked to a location through `LOCATION`. The criminal involved is linked through `CRIME_RECORD`, and affected victims are linked through `CRIME_VICTIM`.

Patrol units are assigned to locations through the `PATROL` table, and active dispatch assignments are tracked through `PATROL_DISPATCH`. Police stations monitor locations through the `POLICE_STATION` table. If legal proceedings begin, the case is recorded in `COURT_CASE`. The frontend can display upcoming hearing reminders based on the hearing date data.

---

## 11. Real-World Use of the Project
This project can be used in:
- Police departments
- Crime investigation departments
- Patrol monitoring systems
- Court case tracking systems
- Smart city crime monitoring platforms

---

## 12. Weak Entities in the Project
`CRIME_RECORD` and `CRIME_VICTIM` can be treated as weak or dependent entities because they rely on parent records in `CRIMINAL`, `CRIME`, and `VICTIM`, and they do not carry independent business meaning without those parent tables.

---

## 13. Exception Handling in the Project
Exception handling is implemented in the database through a trigger that prevents inserting crimes with future dates. This protects data quality and enforces a core business rule directly at the database level.

---

## 14. Views Used in the Project
The current schema defines:
- `High_Risk_Criminals`: Displays criminals with high risk level
- `Pending_Court_Cases`: Displays court cases with pending verdict status

Additional analytical views, such as crime-location summaries, can be added later if needed.

---

## 15. Triggers Used in the Project
The current schema defines one trigger:
- `check_crime_date`: Prevents insertion of future crime dates into the `CRIME` table

Other triggers, such as setting default arrest status automatically, are not part of the current implementation and would need to be added separately.

---

## 16. Cursors Used in the Project
The current schema defines one stored procedure that uses a cursor:
- `CountHighSeverity()`: Iterates through crime records and counts crimes with `High` severity

Additional cursor-based procedures, such as listing active patrol units, can be added if required.

---

## 17. Final Project Summary
CrimeInsight is a crime management and analysis system designed to store, manage, and analyze crime-related data such as criminals, crimes, victims, locations, patrol units, patrol dispatch assignments, police stations, and court cases. The project combines a React frontend, an Express backend, and a MySQL database to support monitoring, investigation tracking, reporting, authentication, and decision-making for law enforcement scenarios.
