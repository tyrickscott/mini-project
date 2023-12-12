CREATE DATABASE myGaragestore;
USE myGaragestore;

GRANT ALL PRIVILEGES ON myGaragestore.* TO 'appuser'@'localhost';

CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, 
                    first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, 
                    email VARCHAR(255) NOT NULL, hashedPassword VARCHAR(255) NOT NULL);

CREATE TABLE tools (
    id INT AUTO_INCREMENT,
    name VARCHAR(50),
    category VARCHAR(50), 
    PRIMARY KEY(id)
);

INSERT INTO tools (name, category) VALUES
    ('Screwdriver', 'Hand Tools'),
    ('Wrench', 'Hand Tools'),
    ('Hammer', 'Hand Tools');