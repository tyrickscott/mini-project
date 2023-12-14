CREATE DATABASE myGaragestore;
USE myGaragestore;

GRANT ALL PRIVILEGES ON myGaragestore.* TO 'appuser'@'localhost';

CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, 
                    first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, 
                    email VARCHAR(255) NOT NULL, hashedPassword VARCHAR(255) NOT NULL);

CREATE TABLE locations (
    location_id INT AUTO_INCREMENT,
    location_name VARCHAR(50),
    PRIMARY KEY(location_id)
);

CREATE TABLE tools (
    tool_id INT AUTO_INCREMENT,
    name VARCHAR(50),
    category VARCHAR(50),
    location_id INT,
    PRIMARY KEY(tool_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

INSERT INTO locations (location_name) VALUES
    ('Garage'),
    ('Shed');

INSERT INTO tools (name, category) VALUES
    ('Screwdriver', 'Hand Tools'),
    ('Wrench', 'Hand Tools'),
    ('Hammer', 'Hand Tools');