#Project Assigment

### Teacher Student Registration API

## Background

Teachers need a system where they can perform administrative functions for their students. Teachers and students are identified by their email addresses.

#### Install

```sh
$ git clone https://github.com/zymplsi/lb4-register-api.git
$ cd lb4-register-api
$ npm install
$ npm run start
```

Launch the browser to http://localhost:3000/api

#### Local DB setup (MacOS)

1. install MySQL
   https://dev.mysql.com/downloads/mysql/
2. (Optional) Install MySQL WorkBench
   https://dev.mysql.com/downloads/workbench/
3. Set the MySQL connection to the app. The json file for the database connection configuration can be found at src/datasources/register-db.datasource.json

```json
{
  "name": "registerdb",
  "connector": "mysql",
  "url": "",
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "******",
  "database": "registerdb"
}
```

4.  Start the MySQL server and test the connection to the running app.
5.  Create the database `registerdb`.
6.  To quickly setup the tables, run the server application followed by the npm command for migration.
    There is a command-line option flag `--rebuild drop | rebuild`

```sh
$ npm run migrate
```

#### Unit Tests

There are unit tests for the 4 API controllers.

```sh
$ npm run test
```

### API Explorer

The API endpoints are available on the API Explorer at http://localhost:3000/api.
To start testing the APIs , create a list of teacher resource on the server with the `/api/teacher` endpoint.
Please note that the APIs does not check for valid email addresses.
