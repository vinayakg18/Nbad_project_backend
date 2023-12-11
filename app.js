const express = require('express');
const compression = require('compression');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const app = express();
const jwt = require('jsonwebtoken');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'root', 
  database: 'budgetApp',
});


connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

app.use(cors()); 

app.use(bodyParser.json());
app.use(compression());


app.get('/api/data', (req, res) => {
  connection.query('SELECT * FROM your_table', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  console.log('Inside server signup');
  
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).send('Error inserting user');
      return;
    }
    console.log('User inserted:', result);
    res.status(200).send('User inserted successfully');
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Inside server login');

  
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Error checking user credentials:', err);
      res.status(500).send('Error checking user credentials');
      return;
    }

    if (result.length > 0) {
     
      const token = jwt.sign({ username }, 'secret', { expiresIn: '1m' });
      
      res.status(200).json({ message: 'Login successful', token, user: result[0] });
    } else {
      
      console.log('User not found');
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});


app.post('/refreshToken', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ message: 'Token verification failed' });
    }

    const { username } = decoded;
    const newToken = jwt.sign({ username }, 'secret', { expiresIn: '1m' });

    res.status(200).json({ token: newToken });
  });
});


app.post('/addBudget', (req, res) => {
  const { username, month, item, budget } = req.body;

 
  const selectQuery = 'SELECT * FROM budgets WHERE username = ? AND month = ? AND item = ?';
  connection.query(selectQuery, [username, month, item], (err, result) => {
    if (err) {
      console.error('Error checking existing record:', err);
      res.status(500).json({ error: 'Error checking existing record' });
      return;
    }

    if (result.length > 0) {
      
      const updatedBudget = parseFloat(result[0].budget) + parseFloat(budget);
      const updateQuery = 'UPDATE budgets SET budget = ? WHERE username = ? AND month = ? AND item = ?';
      connection.query(updateQuery, [updatedBudget, username, month, item], (updateErr) => {
        if (updateErr) {
          console.error('Error updating existing record:', updateErr);
          res.status(500).json({ error: 'Error updating existing record' });
          return;
        }
        console.log('Record updated successfully');
        res.status(200).json({ message: 'Record updated successfully' });
      });
    } else {
      
      const insertQuery = 'INSERT INTO budgets (username, month, item, budget) VALUES (?, ?, ?, ?)';
      connection.query(insertQuery, [username, month, item, budget], (insertErr) => {
        if (insertErr) {
          console.error('Error inserting new record:', insertErr);
          res.status(500).json({ error: 'Error inserting new record' });
          return;
        }
        console.log('New record inserted successfully');
        res.status(200).json({ message: 'New record inserted successfully' });
      });
    }
  });
});


app.post('/addCapacity', (req, res) => {
  const { username, month, item, capacity } = req.body;

  const selectQuery = `
    SELECT * FROM budgets 
    WHERE username = ? AND month = ? AND item = ?
  `;

  connection.query(selectQuery, [username, month, item], (selectErr, selectResults) => {
    if (selectErr) {
      console.error('Error selecting data:', selectErr);
      return res.status(500).json({ message: 'Error retrieving data' });
    }

    if (selectResults.length > 0) {
     
      const updateQuery = `
        UPDATE budgets 
        SET capacity = ? 
        WHERE username = ? AND month = ? AND item = ?
      `;

      connection.query(updateQuery, [capacity, username, month, item], (updateErr, updateResults) => {
        if (updateErr) {
          console.error('Error updating capacity:', updateErr);
          return res.status(500).json({ message: 'Error updating capacity' });
        }
        return res.json({ message: 'Capacity updated for existing record' });
      });
    } else {
      
      const insertQuery = `
        INSERT INTO budgets (username, month, item, budget, capacity) 
        VALUES (?, ?, ?, 0, ?)
      `;

      connection.query(insertQuery, [username, month, item, capacity], (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Error inserting new record:', insertErr);
          return res.status(500).json({ message: 'Error creating new record' });
        }
        return res.json({ message: 'New record created with capacity' });
      });
    }
  });
});

app.get('/getBudgetsByMonth', (req, res) => {
  const { username, month } = req.query;

 
  const query = `SELECT * FROM budgets WHERE username = ? AND month = ?`;
  connection.query(query, [username, month], (error, results) => {
    if (error) {
      console.error('Error fetching budget data:', error);
      res.status(500).json({ error: 'An error occurred while fetching budget data.' });
    } else {
      res.status(200).json(results); 
    }
  });
});

module.exports = app;
