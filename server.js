const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

//Connection settings
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",  //Input password before using application
    database: "employeeDB"
});

//Establish connection
connection.connect(function (err) {
    if (err) throw err;
});

//Kickoff application
init();

function init() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View all employees", "View employees by department", "View employees by role",
                "Add department", "Add role", "Add employee", "Change employee role", "Exit"],
            name: "choice"
        }
    ]).then(({ choice }) => {
        if (choice == "View all employees") {
            showAll();
        }
        else if (choice == "View employees by department") {
            showAllByDept();
        }
        else if (choice == "View employees by role") {
            showAllByRole();
        }
        else if (choice == "Add department") {
            addDept();
        }
        else if (choice == "Add role") {
            addRole();
        }
        else if (choice == "Add employee") {
            addEmployee();
        }
        else if (choice == "Change employee role") {
            changeRole();
        } else {
            connection.end();
        }
    });
}

//Query all employees in DB
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

//Query all employees and order by dept
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

//Query all employees and order by role
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

//Add department record to DB
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
            {
                name: deptName
            },
            function (err, res) {
                if (err) throw err;
                init();
            }
        );
    });
}

//Add role record to DB
function addRole() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        let deptChoices = [];
        //Get list of departments
        res.forEach(dept => {
            deptChoices.push(dept.name);
        });
        inquirer.prompt([
            {
                type: "input",
                message: "What is the role's title?",
                name: "userTitle"
            },
            {
                type: "number",
                message: "What is the role's salary?",
                name: "userSalary"
            },
            {
                type: "list",
                message: "What department does the role belong to?",
                choices: deptChoices,
                name: "userDept"
            }
        ]).then(answers => {
            let deptID;
            //Find user specified dept
            res.forEach(dept => {
                if (dept.name == answers.userDept) {
                    deptID = dept.id;
                }
            });
            //Insert dept record into DB
            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: answers.userTitle,
                    salary: answers.userSalary,
                    departmentID: deptID
                },
                function (err, res) {
                    if (err) throw err;
                    init();
                }
            );
        });
    });
}

//Add employee record to DB
function addEmployee() {
    let roleList = [];
    let employeeList = [];
    let employeeListName = "";
    //Get list of roles
    connection.query("SELECT * FROM role", function (err, role) {
        if (err) throw err;
        role.forEach(role => {
            roleList.push(role.title);
        });
        //Get list of employees to select a manager from
        connection.query("SELECT * FROM employee", function (err, employee) {
            if (err) throw err;
            employee.forEach(employee => {
                employeeListName = employee.firstName + " " + employee.lastName;
                employeeList.push(employeeListName);
            });
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the employee's first name?",
                    name: "userFirstName"
                },
                {
                    type: "input",
                    message: "What is the employee's last name?",
                    name: "userLastName"
                },
                {
                    type: "list",
                    message: "What role does the employee belong to?",
                    choices: roleList,
                    name: "userRole"
                },
                {
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: employeeList,
                    name: "userManager"
                }
            ]).then(answers => {
                let userRoleID;
                let userManagerID;
                //Match user selected role
                role.forEach(role => {
                    if (answers.userRole === role.title) {
                        userRoleID = role.id;
                    }
                });
                //Match user selected manager
                let userManagerArr = answers.userManager.split(" ");
                employee.forEach(employee => {
                    if (userManagerArr[0] === employee.firstName && userManagerArr[1] === employee.lastName) {
                        userManagerID = employee.id;
                    }
                });
                //Insert employee record into DB
                connection.query(
                    "INSERT INTO employee SET ?",
                    {
                        firstName: answers.userFirstName,
                        lastName: answers.userLastName,
                        roleID: userRoleID,
                        managerID: userManagerID
                    },
                    function (err, res) {
                        if (err) throw err;
                        init();
                    }

                );
            });
        });

    });
}

function changeRole() {
    let roleList = [];
    let employeeList = [];
    let employeeListName = "";
    //Get list of roles
    connection.query("SELECT * FROM role", function (err, role) {
        if (err) throw err;
        role.forEach(role => {
            roleList.push(role.title);
        });
        //Get list of employees
        connection.query("SELECT * FROM employee", function (err, employee) {
            if (err) throw err;
            employee.forEach(employee => {
                employeeListName = employee.firstName + " " + employee.lastName;
                employeeList.push(employeeListName);
            });
            inquirer.prompt([
                {
                    type: "list",
                    message: "Which employee would you like to change the role of?",
                    choices: employeeList,
                    name: "userEmployee"
                },
                {
                    type: "list",
                    message: "What role would you like to change it to?",
                    choices: roleList,
                    name: "userRole"
                }
            ]).then(answers => {
                let userRoleID;
                let userEmployeeID;
                //Match user selected role
                role.forEach(role => {
                    if (answers.userRole === role.title) {
                        userRoleID = role.id;
                    }
                });
                //Match user selected employee
                let userEmployeeArr = answers.userEmployee.split(" ");
                employee.forEach(employee => {
                    if (userEmployeeArr[0] === employee.firstName && userEmployeeArr[1] === employee.lastName) {
                        userEmployeeID = employee.id;
                    }
                });
                //Insert updated employee role record
                connection.query(
                    "UPDATE employee SET ? WHERE ?",
                    [
                      {
                        roleID: userRoleID
                      },
                      {
                        id: userEmployeeID
                      }
                    ],
                    function(err, res) {
                      if (err) throw err;
                      init();
                    }
                );
            });
        });

    });
}



