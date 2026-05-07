CREATE DATABASE IF NOT EXISTS hospital;
USE hospital;

CREATE TABLE patients (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  age       INT NOT NULL CHECK (age BETWEEN 1 AND 120),
  gender    ENUM('Male','Female','Other') NOT NULL,
  phone     CHAR(10) UNIQUE NOT NULL,
  blood_grp ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  specialty  VARCHAR(100) NOT NULL,
  phone      CHAR(10) UNIQUE NOT NULL,
  email      VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(10) UNIQUE NOT NULL,
  type   ENUM('General','ICU','Private') NOT NULL,
  status ENUM('Available','Occupied') DEFAULT 'Available'
);

CREATE TABLE appointments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id  INT NOT NULL,
  date       DATE NOT NULL,
  reason     VARCHAR(200) NOT NULL,
  status     ENUM('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
);

CREATE TABLE bills (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  amount     DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  paid       ENUM('Paid','Unpaid') DEFAULT 'Unpaid',
  date       DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Useful views
CREATE VIEW appointment_details AS
  SELECT a.id, p.name AS patient, p.phone AS patient_phone,
         d.name AS doctor, d.specialty,
         a.date, a.reason, a.status
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN doctors  d ON a.doctor_id  = d.id;

CREATE VIEW unpaid_bills AS
  SELECT b.id, p.name AS patient, b.amount, b.date
  FROM bills b
  JOIN patients p ON b.patient_id = p.id
  WHERE b.paid = 'Unpaid';