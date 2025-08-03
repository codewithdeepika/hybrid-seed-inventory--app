const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // replace with your MySQL username
  password: "conrad", // replace with your MySQL password
  database: "seed_inventory"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// Create tables if they don't exist
const createTables = () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS inward (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seedName VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      party VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS outward (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seedName VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      party VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS returns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seedName VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      reason VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS expiry (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seedName VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      expiryDate DATE NOT NULL,
      action VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  queries.forEach(query => {
    db.query(query, (err) => {
      if (err) throw err;
    });
  });
};

createTables();

// API Endpoints

// Create operations
app.post("/api/inward", (req, res) => {
  const { seedName, quantity, party, date, notes } = req.body;
  const query = "INSERT INTO inward (seedName, quantity, party, date, notes) VALUES (?, ?, ?, ?, ?)";
  
  db.query(query, [seedName, quantity, party, date, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Inward entry added", id: result.insertId });
  });
});

app.post("/api/outward", (req, res) => {
  const { seedName, quantity, party, date, notes } = req.body;
  const query = "INSERT INTO outward (seedName, quantity, party, date, notes) VALUES (?, ?, ?, ?, ?)";
  
  db.query(query, [seedName, quantity, party, date, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Outward entry added", id: result.insertId });
  });
});

app.post("/api/returns", (req, res) => {
  const { seedName, quantity, reason, date, notes } = req.body;
  const query = "INSERT INTO returns (seedName, quantity, reason, date, notes) VALUES (?, ?, ?, ?, ?)";
  
  db.query(query, [seedName, quantity, reason, date, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Return entry added", id: result.insertId });
  });
});

app.post("/api/expiry", (req, res) => {
  const { seedName, quantity, expiryDate, action } = req.body;
  const query = "INSERT INTO expiry (seedName, quantity, expiryDate, action) VALUES (?, ?, ?, ?)";
  
  db.query(query, [seedName, quantity, expiryDate, action], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Expiry entry added", id: result.insertId });
  });
});

// Read operations
app.get("/api/inward", (req, res) => {
  db.query("SELECT * FROM inward ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/outward", (req, res) => {
  db.query("SELECT * FROM outward ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/returns", (req, res) => {
  db.query("SELECT * FROM returns ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/expiry", (req, res) => {
  db.query("SELECT * FROM expiry ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Delete operations
app.delete("/api/inward/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM inward WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.json({ message: "Inward entry deleted" });
  });
});

app.delete("/api/outward/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM outward WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.json({ message: "Outward entry deleted" });
  });
});

app.delete("/api/returns/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM returns WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.json({ message: "Return entry deleted" });
  });
});

app.delete("/api/expiry/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM expiry WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.json({ message: "Expiry entry deleted" });
  });
});

// Reports endpoint
app.get("/api/reports", (req, res) => {
  Promise.all([
    new Promise(resolve => db.query("SELECT * FROM inward", (err, results) => resolve(results))),
    new Promise(resolve => db.query("SELECT * FROM outward", (err, results) => resolve(results))),
    new Promise(resolve => db.query("SELECT * FROM returns", (err, results) => resolve(results))),
    new Promise(resolve => db.query("SELECT * FROM expiry", (err, results) => resolve(results)))
  ])
  .then(([inwardData, outwardData, returnData, expiryData]) => {
    res.json({ inwardData, outwardData, returnData, expiryData });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Serve the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));  