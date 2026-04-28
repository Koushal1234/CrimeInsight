# CRIMEINSIGHT - FULL PROJECT DOCUMENTATION

## 1. Project Title
CrimeInsight: Crime Management and Analysis System

---

## 2. Problem Statement
The main problem faced by law enforcement agencies is that crime-related data is stored in different places such as criminal records, crime reports, victim records, patrol records, and court case files. Because the data is scattered, it becomes difficult to track criminals, monitor crime patterns, identify high-risk areas, and manage ongoing investigations.

The CrimeInsight system solves this problem by integrating all crime-related data into a single centralized database system. This system helps police departments manage crime records efficiently, track criminals and victims, monitor patrol units, analyze crime hotspots, and manage court case information. It improves decision-making, investigation tracking, and crime prevention strategies.

---

## 3. Objectives of the Project
- To store crime and criminal data in a structured database
- To track criminals and victims involved in crimes
- To identify high-risk crime locations
- To manage patrol units assigned to locations
- To track court cases and hearing dates
- To analyze crime data using SQL queries
- To help police in decision making and investigation

---

## 4. Modules in the Project
- Person Module - Stores details of all persons
- Criminal Module - Stores criminal details
- Victim Module - Stores victim details
- Crime Module - Stores crime details
- Crime Record Module - Links criminal and crime
- Location Module - Stores crime locations
- Patrol Module - Stores patrol units
- Police Station Module - Stores station details
- Court Case Module - Stores legal case details
- Officer Module - Login system

---

## 5. Database Tables
- PERSON - Stores all people
- CRIMINAL - Criminal details
- VICTIM - Victim details
- CRIME - Crime details
- CRIME_RECORD - Criminal and Crime relationship
- CRIME_VICTIM - Crime and Victim relationship
- LOCATION - Crime locations
- PATROL - Patrol units
- PATROL_DISPATCH - Patrol and active crime assignment details
- POLICE_STATION - Police stations
- COURT_CASE - Court cases
- OFFICER - Login details

---

## 6. Relationships
- PERSON -> CRIMINAL (One-to-One)
- PERSON -> VICTIM (One-to-One)
- CRIMINAL -> CRIME (Many-to-Many via CRIME_RECORD)
- CRIME -> VICTIM (Many-to-Many via CRIME_VICTIM)
- CRIME -> LOCATION (Many-to-One)
- PATROL -> LOCATION (Many-to-One)
- PATROL -> CRIME (Active assignment through PATROL_DISPATCH)
- POLICE_STATION -> LOCATION (One-to-One)
- CRIME -> COURT_CASE (One-to-Many)

---

## 7. Key Features of the System
- Crime Management - Add and track crimes
- Criminal Management - Add criminal and risk level
- Victim Management - Store victim details
- Location Risk Analysis - Identify crime hotspots
- Patrol Management - Assign patrol units
- Court Case Tracking - Track hearing dates and verdicts
- Dashboard - Shows total crimes, active cases, patrols, alerts
- Hearing Reminder - Notification before hearing date
- Officer Authentication - Role-based login access

---

## 8. Technologies Used
- Frontend: React / TypeScript
- Backend: Node.js
- Database: MySQL
- IDE: VS Code
- Database Tool: MySQL Workbench

---

## 9. SQL Concepts Used
- Constraints - Used to filter specific data
- Aggregate Functions - Used for counting and analysis
- Set Operations - Used for comparing data
- Subqueries - Used for complex filtering
- Joins - Used to combine multiple tables
- Views - Used to create virtual tables
- Triggers - Used for automatic validation
- Cursors - Used for row-by-row processing

---

## 10. System Workflow
Person details are first added into the PERSON table. A person can be categorized as either a criminal or a victim. When a crime occurs, the crime details are stored in the CRIME table. The criminal involved in the crime is linked through the CRIME_RECORD table, and the victim is linked through the CRIME_VICTIM table. Each crime is associated with a location. Patrol units are assigned to locations, and police stations monitor locations. If a legal case is filed, it is stored in the COURT_CASE table, and hearing reminders are generated.

---

## 11. Real-World Use of the Project
This system can be used in police departments, crime investigation departments, patrol monitoring systems, court case tracking systems, and smart city crime monitoring systems.

---

## 12. Weak Entities in the Project
CRIME_RECORD and CRIME_VICTIM are weak entities because they depend on other tables and cannot exist without CRIME, CRIMINAL, or VICTIM tables.

---

## 13. Exception Handling in the Project
Exception handling is used to prevent invalid data entry such as future crime dates. Triggers are used to automatically validate data before insertion into the database.

---

## 14. Views Used in the Project
Views are used to display high-risk criminals, crime and location details, and pending court cases without writing complex queries repeatedly.

---

## 15. Triggers Used in the Project
Triggers are used to:
- Prevent future crime date insertion
- Automatically set default arrest status
- Maintain data consistency

---

## 16. Cursors Used in the Project
Cursors are used to process records row by row, such as counting high severity crimes and listing active patrol units.

---

## 17. Final Project Summary
CrimeInsight is a database management system designed to store, manage, and analyze crime-related data such as criminals, crimes, victims, locations, patrol units, and court cases. The system helps police departments in crime analysis, investigation tracking, patrol management, and court case monitoring, improving decision-making and crime prevention.

---
