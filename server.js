const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "poopoo12",
    database: "employeeDB"
});

init();

function init() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View all employees", "View employees by department", "View employees by role",
                "Add department", "Add role", "Exit"],
            name: "choice"
        }
    ]).then(({ choice }) => {
        if (choice == "View all employees") {
            showAll();     
        }
        if (choice == "View employees by department") {
            showAllByDept();
        }
        if (choice == "View employees by role") {
            showAllByRole();
            init();
        }
        if (choice == "Add department") {
            addDept();
        }
        if (choice == "Add role"){
            addRole();
        }
    });
}

function showAll() {
    connection.query(
        `SELECT e.id, e.firstName, e.lastName, department.name department, title, salary, m.firstName managerFirstName, m.lastName managerLastName
    FROM employee e
    JOIN role ON e.roleID = role.id
    JOIN department ON role.departmentID = department.id
    LEFT JOIN employee m ON m.id = e.managerID`, function (err, res) {
        if (err) throw err;
        console.table(res);
        init();
    });
    
}

function showAllByDept() {
    connection.query(
        `SELECT e.id, e.firstName, e.lastName, department.name department, title, salary, m.firstName managerFirstName, m.lastName managerLastName
    FROM employee e
    JOIN role ON e.roleID = role.id
    JOIN department ON role.departmentID = department.id
    LEFT JOIN employee m ON m.id = e.managerID
    ORDER BY department.name`, function (err, res) {
        if (err) throw err;
        console.table(res);
        init();
    });
}

function showAllByRole() {
    connection.query(
        `SELECT e.id, e.firstName, e.lastName, department.name department, title, salary, m.firstName managerFirstName, m.lastName managerLastName
    FROM employee e
    JOIN role ON e.roleID = role.id
    JOIN department ON role.departmentID = department.id
    LEFT JOIN employee m ON m.id = e.managerID
    ORDER BY role.title`, function (err, res) {
        if (err) throw err;
        console.table(res);
        init();
    });
}

function addDept() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the department name you would like to add?",
            name: "deptName"
        }
    ]).then(({ deptName }) => {
        connection.query(
            "INSERT INTO department SET ?",
            //Example object being inserted
            {
                name: deptName
            },
            // Here is the callback function
            function (err, res) {
                if (err) throw err;
                //console.log(res.affectedRows + " product inserted!\n"); //affectedRows is provided by SQL
                init();
            }
        );   
    });  
}