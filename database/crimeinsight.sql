-- ============================================
-- CRIMEINSIGHT DATABASE CREATION
-- ============================================
CREATE DATABASE IF NOT EXISTS CRIMEINSIGHT;
USE CRIMEINSIGHT;

-- ============================================
-- DROP EXISTING OBJECTS FOR RE-RUNNING SCRIPT
-- ============================================
DROP VIEW IF EXISTS High_Risk_Criminals;
DROP VIEW IF EXISTS Pending_Court_Cases;
DROP TRIGGER IF EXISTS check_crime_date;
DROP PROCEDURE IF EXISTS CountHighSeverity;

DROP TABLE IF EXISTS COURT_CASE;
DROP TABLE IF EXISTS PATROL_DISPATCH;
DROP TABLE IF EXISTS POLICE_STATION;
DROP TABLE IF EXISTS PATROL;
DROP TABLE IF EXISTS CRIME_VICTIM;
DROP TABLE IF EXISTS CRIME_RECORD;
DROP TABLE IF EXISTS CRIME;
DROP TABLE IF EXISTS LOCATION;
DROP TABLE IF EXISTS VICTIM;
DROP TABLE IF EXISTS CRIMINAL;
DROP TABLE IF EXISTS PERSON;
DROP TABLE IF EXISTS OFFICER;

-- ============================================
-- PERSON TABLE
-- Stores common details of all persons
-- ============================================
CREATE TABLE PERSON (
    person_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL
);

-- ============================================
-- CRIMINAL TABLE
-- Stores criminal details linked to PERSON
-- ============================================
CREATE TABLE CRIMINAL (
    criminal_id INT PRIMARY KEY,
    risk_level ENUM('Low', 'Medium', 'High') NOT NULL,
    FOREIGN KEY (criminal_id) REFERENCES PERSON(person_id)
        ON DELETE CASCADE
);

-- ============================================
-- VICTIM TABLE
-- Stores victim details linked to PERSON
-- ============================================
CREATE TABLE VICTIM (
    victim_id INT PRIMARY KEY,
    contact_number VARCHAR(15) NOT NULL,
    FOREIGN KEY (victim_id) REFERENCES PERSON(person_id)
        ON DELETE CASCADE
);

-- ============================================
-- LOCATION TABLE
-- Stores crime-prone areas and risk analysis
-- ============================================
CREATE TABLE LOCATION (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    crime_frequency INT NOT NULL DEFAULT 0,
    risk_status ENUM('Low', 'Medium', 'High') NOT NULL
);

-- ============================================
-- CRIME TABLE
-- Stores crime details with linked location
-- ============================================
CREATE TABLE CRIME (
    crime_id INT AUTO_INCREMENT PRIMARY KEY,
    crime_type VARCHAR(50) NOT NULL,
    crime_date DATE NOT NULL,
    severity_level ENUM('Low', 'Medium', 'High') NOT NULL,
    description TEXT,
    location_id INT NOT NULL,
    status ENUM('Open', 'Under Investigation', 'Closed') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================
-- CRIME_RECORD TABLE
-- Links criminals and crimes
-- One criminal can be linked to many crimes
-- One crime can involve many criminals
-- ============================================
CREATE TABLE CRIME_RECORD (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    criminal_id INT NOT NULL,
    crime_id INT NOT NULL,
    arrest_status ENUM('Arrested', 'Under Investigation', 'Released') NOT NULL DEFAULT 'Under Investigation',
    FOREIGN KEY (criminal_id) REFERENCES CRIMINAL(criminal_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (crime_id) REFERENCES CRIME(crime_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE (criminal_id, crime_id)
);

-- ============================================
-- CRIME_VICTIM TABLE
-- Links victims and crimes
-- One crime can affect many victims
-- One victim can be linked to many crimes
-- ============================================
CREATE TABLE CRIME_VICTIM (
    cv_id INT AUTO_INCREMENT PRIMARY KEY,
    crime_id INT NOT NULL,
    victim_id INT NOT NULL,
    FOREIGN KEY (crime_id) REFERENCES CRIME(crime_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE (crime_id, victim_id)
);

-- ============================================
-- PATROL TABLE
-- Stores patrol unit assignment details
-- ============================================
CREATE TABLE PATROL (
    patrol_id INT AUTO_INCREMENT PRIMARY KEY,
    patrol_unit_name VARCHAR(50) NOT NULL,
    officer_in_charge VARCHAR(50) NOT NULL,
    shift_time ENUM('Morning', 'Evening', 'Night') NOT NULL,
    patrol_status ENUM('Active', 'Inactive', 'Standby') NOT NULL DEFAULT 'Standby',
    location_id INT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================
-- PATROL_DISPATCH TABLE
-- Stores active crime assignments for patrol units
-- ============================================
CREATE TABLE PATROL_DISPATCH (
    dispatch_id INT AUTO_INCREMENT PRIMARY KEY,
    patrol_id INT NOT NULL UNIQUE,
    crime_id INT NOT NULL,
    assigned_by_officer_id INT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patrol_id) REFERENCES PATROL(patrol_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (crime_id) REFERENCES CRIME(crime_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (assigned_by_officer_id) REFERENCES OFFICER(officer_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================
-- POLICE_STATION TABLE
-- Stores police station details for locations
-- ============================================
CREATE TABLE POLICE_STATION (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(50) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    location_id INT UNIQUE NOT NULL,
    operational_status ENUM('Operational', 'Under Maintenance', 'Closed') NOT NULL DEFAULT 'Operational',
    FOREIGN KEY (location_id) REFERENCES LOCATION(location_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================
-- COURT_CASE TABLE
-- Stores legal case details linked to crimes
-- ============================================
CREATE TABLE COURT_CASE (
    case_no INT AUTO_INCREMENT PRIMARY KEY,
    crime_id INT NOT NULL,
    court_name VARCHAR(50) NOT NULL,
    hearing_date DATE NOT NULL,
    judge_name VARCHAR(50) NOT NULL,
    verdict ENUM('Pending', 'Closed') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crime_id) REFERENCES CRIME(crime_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- OFFICER TABLE
-- Stores login credentials of officers
-- ============================================
CREATE TABLE OFFICER (
    officer_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Officer', 'Investigator') NOT NULL
);

-- ============================================
-- INSERT SAMPLE OFFICER DATA
-- ============================================
INSERT INTO OFFICER (username, password, role)
VALUES
    ('admin', 'admin123', 'Admin'),
    ('inspector1', 'police123', 'Officer');

-- ============================================
-- INSERT SAMPLE PERSON DATA
-- First 5 persons are criminals
-- Next 5 persons are victims
-- ============================================
INSERT INTO PERSON (first_name, last_name, date_of_birth, gender, street, city, state, pincode)
VALUES
    ('Ravi', 'Kumar', '1992-05-10', 'Male', 'MG Road', 'Bangalore', 'Karnataka', '560001'),
    ('Suresh', 'Reddy', '1995-08-15', 'Male', 'Anna Nagar', 'Chennai', 'Tamil Nadu', '600040'),
    ('Anita', 'Sharma', '1990-02-20', 'Female', 'Banjara Hills', 'Hyderabad', 'Telangana', '500034'),
    ('Kiran', 'Rao', '1993-09-12', 'Male', 'Gachibowli', 'Hyderabad', 'Telangana', '500032'),
    ('Pooja', 'Singh', '1998-11-22', 'Female', 'Whitefield', 'Bangalore', 'Karnataka', '560066'),
    ('Rahul', 'Das', '1991-03-18', 'Male', 'T Nagar', 'Chennai', 'Tamil Nadu', '600017'),
    ('Neha', 'Verma', '1996-06-25', 'Female', 'Velachery', 'Chennai', 'Tamil Nadu', '600042'),
    ('Vikram', 'Patil', '1989-07-30', 'Male', 'Kukatpally', 'Hyderabad', 'Telangana', '500072'),
    ('Meera', 'Iyer', '1997-01-14', 'Female', 'Indiranagar', 'Bangalore', 'Karnataka', '560038'),
    ('Arjun', 'Mehta', '1988-12-05', 'Male', 'Hitech City', 'Hyderabad', 'Telangana', '500081');

-- ============================================
-- INSERT SAMPLE CRIMINAL DATA
-- ============================================
INSERT INTO CRIMINAL (criminal_id, risk_level)
VALUES
    (1, 'High'),
    (2, 'Medium'),
    (3, 'Low'),
    (4, 'High'),
    (5, 'Low');

-- ============================================
-- INSERT SAMPLE VICTIM DATA
-- ============================================
INSERT INTO VICTIM (victim_id, contact_number)
VALUES
    (6, '9876543210'),
    (7, '9123456780'),
    (8, '9988776655'),
    (9, '9001122334'),
    (10, '9112233445');

-- ============================================
-- INSERT SAMPLE LOCATION DATA
-- ============================================
INSERT INTO LOCATION (area_name, city, crime_frequency, risk_status)
VALUES
    ('MG Road', 'Bangalore', 25, 'High'),
    ('Anna Nagar', 'Chennai', 18, 'Medium'),
    ('Banjara Hills', 'Hyderabad', 12, 'Low'),
    ('Gachibowli', 'Hyderabad', 20, 'Medium'),
    ('Whitefield', 'Bangalore', 22, 'High');

-- ============================================
-- INSERT SAMPLE CRIME DATA
-- ============================================
INSERT INTO CRIME (crime_type, crime_date, severity_level, description, location_id, status)
VALUES
    ('Theft', '2025-01-10', 'Medium', 'Bike theft reported', 1, 'Open'),
    ('Robbery', '2025-01-12', 'High', 'Bank robbery case', 2, 'Under Investigation'),
    ('Fraud', '2025-01-15', 'Low', 'Online fraud case', 3, 'Closed'),
    ('Assault', '2025-01-18', 'High', 'Street fight incident', 4, 'Under Investigation'),
    ('Cyber Crime', '2025-01-20', 'Medium', 'Hacking complaint', 5, 'Open');

-- ============================================
-- INSERT SAMPLE CRIME_RECORD DATA
-- ============================================
INSERT INTO CRIME_RECORD (criminal_id, crime_id, arrest_status)
VALUES
    (1, 1, 'Arrested'),
    (2, 2, 'Under Investigation'),
    (3, 3, 'Released'),
    (4, 4, 'Arrested'),
    (5, 5, 'Under Investigation');

-- ============================================
-- INSERT SAMPLE CRIME_VICTIM DATA
-- ============================================
INSERT INTO CRIME_VICTIM (crime_id, victim_id)
VALUES
    (1, 6),
    (2, 7),
    (3, 8),
    (4, 9),
    (5, 10);

-- ============================================
-- INSERT SAMPLE PATROL DATA
-- ============================================
INSERT INTO PATROL (patrol_unit_name, officer_in_charge, shift_time, patrol_status, location_id)
VALUES
    ('Alpha-7', 'Sgt. David Park', 'Morning', 'Active', 1),
    ('Bravo-3', 'Lt. Maria Santos', 'Night', 'Active', 2),
    ('Charlie-9', 'Cpl. Alex Turner', 'Night', 'Standby', 3);

-- ============================================
-- INSERT SAMPLE PATROL DISPATCH DATA
-- ============================================
INSERT INTO PATROL_DISPATCH (patrol_id, crime_id, assigned_by_officer_id)
VALUES
    (1, 1, 1),
    (2, 2, 2);

-- ============================================
-- INSERT SAMPLE POLICE STATION DATA
-- ============================================
INSERT INTO POLICE_STATION (station_name, contact_number, street, city, state, pincode, location_id, operational_status)
VALUES
    ('Metro Central Precinct', '9876543210', 'Main Street', 'Bangalore', 'Karnataka', '560001', 1, 'Operational'),
    ('Riverside District Station', '9123456780', 'River Road', 'Chennai', 'Tamil Nadu', '600040', 2, 'Operational');

-- ============================================
-- INSERT SAMPLE COURT CASE DATA
-- ============================================
INSERT INTO COURT_CASE (crime_id, court_name, hearing_date, judge_name, verdict)
VALUES
    (1, 'Bangalore Court', '2025-02-10', 'Judge Sharma', 'Pending'),
    (2, 'Chennai Court', '2025-02-12', 'Judge Reddy', 'Closed'),
    (3, 'Hyderabad Court', '2025-02-15', 'Judge Rao', 'Pending');

-- ============================================
-- VIEW 1: HIGH RISK CRIMINALS
-- Displays all high risk criminals with names
-- ============================================
CREATE VIEW High_Risk_Criminals AS
SELECT
    c.criminal_id,
    p.first_name,
    p.last_name,
    c.risk_level
FROM CRIMINAL c
JOIN PERSON p ON c.criminal_id = p.person_id
WHERE c.risk_level = 'High';

-- ============================================
-- VIEW 2: PENDING COURT CASES
-- Displays only pending court cases
-- ============================================
CREATE VIEW Pending_Court_Cases AS
SELECT
    case_no,
    court_name,
    hearing_date,
    judge_name
FROM COURT_CASE
WHERE verdict = 'Pending';

-- ============================================
-- TRIGGER: CHECK FUTURE CRIME DATE
-- Prevents insertion of future crime dates
-- ============================================
DELIMITER $$

CREATE TRIGGER check_crime_date
BEFORE INSERT ON CRIME
FOR EACH ROW
BEGIN
    IF NEW.crime_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Crime date cannot be in future';
    END IF;
END$$

-- ============================================
-- PROCEDURE: COUNT HIGH SEVERITY CRIMES
-- Uses cursor to count crimes with High severity
-- ============================================
CREATE PROCEDURE CountHighSeverity()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE sev VARCHAR(20);
    DECLARE total INT DEFAULT 0;

    DECLARE cur CURSOR FOR
        SELECT severity_level FROM CRIME;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO sev;
        IF done THEN
            LEAVE read_loop;
        END IF;

        IF sev = 'High' THEN
            SET total = total + 1;
        END IF;
    END LOOP;

    CLOSE cur;

    SELECT total AS High_Severity_Count;
END$$

DELIMITER ;

-- ============================================
-- CALL PROCEDURE
-- ============================================
CALL CountHighSeverity();
