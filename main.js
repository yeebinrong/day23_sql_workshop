// load libraries
const express = require('express')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const secure = require('secure-env')
const { json } = require('body-parser')

// create an instance of express
const app = express()

// declare the port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// retrieve env variables
global.env = secure({secret: process.env.ENV_PASSWORD})

// declare pool
const pool = mysql.createPool({
    host: global.env.SQL_HOST,
    port: global.env.SQL_PORT,
    user: global.env.SQL_USER,
    password: global.env.SQL_PASS,
    database: global.env.SQL_SCHEMA,
    connectionLimit: global.env.SQL_CON_LIMIT
})

// use cors header
app.use(cors())

// use morgan logging
app.use(morgan('combined'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.post('/api/data' , (req, resp) => {
    const data = req.body
    insertOrder(data);
    resp.status(200);
    resp.type('json');
    resp.json({});
})

const insertOrder = async (data) => {
    console.info(data)
    const conn = await pool.getConnection();
    try {
        // await conn.query('SET autocommit = false') // Have to use in mysql workbench?
        await conn.beginTransaction();
        await conn.query(`INSERT INTO orders (CustomerID, EmployeeID) values (?, ?)`, [data.customer_id, data.employee_id]);
        await conn.query(`SELECT @OrderID:=MAX(OrderID)+1 FROM orders`);
        await conn.query(`SELECT @UnitPrice:= UnitPrice FROM products WHERE ProductID = ?`, [data.product_id]);
        await conn.query('INSERT INTO `order details` (OrderID, ProductID, UnitPrice, Quantity, Discount) values (@OrderID, ?, @UnitPrice, ?, ?)', [data.product_id, data.product_qty, 0])
        console.info((await conn.query(`SELECT * FROM orders WHERE OrderID = (@OrderID)-1`))[0])
        await conn.query("COMMIT");
        console.info("finished")
    } catch (e) {
        conn.rollback();
        console.info(`Error posting data : ${e}`);
    } finally {
        conn.release();
    }
}

const startApp = async (app, pool) => {
    try {
        // get connection from db
        const conn = await pool.getConnection()
        console.info("Pinging database...")
        await conn.ping()

        // release connection
        conn.release()
        console.info("Pinging successful...")
        // listen for port
        app.listen(PORT, () => {
            console.info(`Application is listening PORT ${PORT} at ${new Date()}.`)
        })
    } catch (e) {
        console.error(`Error pinging the database : ${e}.`)
    }
}

startApp(app, pool)