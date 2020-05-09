DROP DATABASE IF EXISTS employeeDB;
CREATE DATABASE employeeDB;
USE employeeDB;

CREATE TABLE department (
    id INTEGER(11) AUTO_INCREMENT NOT NULL,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id INTEGER(11) AUTO_INCREMENT NOT NULL,
    title VARCHAR(30),
    salary DECIMAL(10,2),
    departmentID INTEGER,
    PRIMARY KEY (id)
);

CREATE TABLE employee (
    id INTEGER(11) AUTO_INCREMENT NOT NULL,
    firstName VARCHAR(30),
    lastName VARCHAR(30),
    roleID INTEGER,
    managerID INTEGER,
    PRIMARY KEY (id)
);

INSERT INTO department (name) VALUES ("Sales"), ("HR"), ("Development");

INSERT INTO role (title, salary, departmentID) VALUES ("Sales Associate", 50000.00, 1),
("HR Associate", 40000.00, 2), ("Software Developer", 60000.00, 3);

INSERT INTO employee (firstName, lastName, roleID, managerID) VALUES
("Johnny", "Cash", 1, 4),
("Cindy", "Lauper", 2, 4),
("Al", "Bundy", 3, 4),
("Master", "Blaster", 3, NULL)