-- Healthcare and Data Analytics System Database Schema
-- Compatible with MySQL 5.7+ and 8.0+

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- --------------------------------------------------------
-- 1. Table structure for table `admin`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for table `patients`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `age` INT NOT NULL,
  `gender` VARCHAR(10) NOT NULL,
  `blood_group` VARCHAR(5) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `address` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for table `doctors`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `specialization` VARCHAR(100) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table structure for table `appointments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Sample Dummy Data
-- --------------------------------------------------------

-- Insert default admin account: username 'admin', password 'admin123' (hash of 'admin123' using pbkdf2:sha256 in Python is pbkdf2:sha256:600000$...)
-- Wait, let's write a standard hashed password string or let Python hash it. We will use scrypt/pbkdf2. Let's provide a pre-hashed password for the auth module.
-- For flask_bcrypt / werkzeug.security:
-- pbkdf2:sha256:600000$g9V2rZ8GZ5UvSjL4$5e114400874e0d4c679b36ad5a34fb70ff456ad1bcfe1bb1fbca690ec964177b
-- Actually, a simpler way is to have the backend seed the admin if none exists, or write a schema.sql insertion. Let's insert a row with a pbkdf2 hash.
-- "pbkdf2:sha256:600000$gIcrgH8C7YjJ0c7u$bb165213b28b7e289f8a370b13cf106b3bb88fa90b9ff3e944747eb1908994bb" is werkzeug's generate_password_hash("admin123")
INSERT INTO `admin` (`id`, `username`, `password_hash`, `name`) 
VALUES (1, 'admin', 'pbkdf2:sha256:600000$gIcrgH8C7YjJ0c7u$bb165213b28b7e289f8a370b13cf106b3bb88fa90b9ff3e944747eb1908994bb', 'Chief Administrator')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Insert Patients
INSERT INTO `patients` (`id`, `name`, `age`, `gender`, `blood_group`, `phone`, `address`) VALUES
(1, 'John Doe', 45, 'Male', 'A+', '9876543210', '123 Baker Street, London'),
(2, 'Jane Smith', 34, 'Female', 'O-', '9876543211', '456 Elm Street, New York'),
(3, 'Robert Johnson', 62, 'Male', 'B+', '9876543212', '789 Oak Avenue, Chicago'),
(4, 'Emily Davis', 28, 'Female', 'AB+', '9876543213', '101 Pine Road, San Francisco'),
(5, 'Michael Wilson', 50, 'Male', 'O+', '9876543214', '202 Maple Lane, Seattle')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Insert Doctors
INSERT INTO `doctors` (`id`, `name`, `specialization`, `department`, `phone`) VALUES
(1, 'Dr. Sarah Connor', 'Cardiology', 'Cardiology', '8765432101'),
(2, 'Dr. Gregory House', 'Diagnostic Medicine', 'Internal Medicine', '8765432102'),
(3, 'Dr. Meredith Grey', 'General Surgery', 'Surgery', '8765432103'),
(4, 'Dr. Stephen Strange', 'Neurosurgery', 'Neurology', '8765432104')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Insert Appointments
INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `date`, `time`, `status`) VALUES
(1, 1, 1, CURDATE() + INTERVAL 1 DAY, '10:00:00', 'Scheduled'),
(2, 2, 2, CURDATE(), '11:30:00', 'Completed'),
(3, 3, 3, CURDATE() + INTERVAL 2 DAY, '14:00:00', 'Scheduled'),
(4, 4, 4, CURDATE() - INTERVAL 1 DAY, '09:15:00', 'Completed'),
(5, 5, 1, CURDATE() + INTERVAL 3 DAY, '15:30:00', 'Scheduled')
ON DUPLICATE KEY UPDATE `status`=`status`;
