const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let db;
mysql.createConnection({
  host: 'localhost', user: 'root',
  password: 'madhav18', database: 'hospital'
}).then(conn => {
  db = conn;
  console.log('✅ MySQL Connected!');
}).catch(err => console.error('❌ MySQL Error:', err.message));

const q = (sql, p) => db.query(sql, p).then(([rows]) => rows);
const validPhone = p => /^\d{10}$/.test(p);

// PATIENTS
app.get('/patients', async (req, res) => {
  try { res.json(await q('SELECT * FROM patients ORDER BY name')); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/patients', async (req, res) => {
  try {
    const { name, age, gender, phone, blood_grp } = req.body;
    if (!name || !age || !phone) return res.status(400).json({ error: 'Name, age, phone required' });
    if (!validPhone(phone)) return res.status(400).json({ error: 'Phone must be 10 digits' });
    await q('INSERT INTO patients (name,age,gender,phone,blood_grp) VALUES (?,?,?,?,?)', [name, age, gender, phone, blood_grp||null]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/patients/:id', async (req, res) => {
  try { await q('DELETE FROM patients WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// DOCTORS
app.get('/doctors', async (req, res) => {
  try { res.json(await q('SELECT * FROM doctors ORDER BY name')); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/doctors', async (req, res) => {
  try {
    const { name, specialty, phone, email } = req.body;
    if (!name || !specialty || !phone) return res.status(400).json({ error: 'All fields required' });
    if (!validPhone(phone)) return res.status(400).json({ error: 'Phone must be 10 digits' });
    await q('INSERT INTO doctors (name,specialty,phone,email) VALUES (?,?,?,?)', [name, specialty, phone, email||null]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/doctors/:id', async (req, res) => {
  try { await q('DELETE FROM doctors WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// APPOINTMENTS
app.get('/appointments', async (req, res) => {
  try {
    res.json(await q(`SELECT a.id, p.name AS patient, d.name AS doctor,
      a.date, a.reason, a.status
      FROM appointments a
      JOIN patients p ON a.patient_id=p.id
      JOIN doctors  d ON a.doctor_id=d.id
      ORDER BY a.date DESC`));
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, date, reason } = req.body;
    if (!date || !reason) return res.status(400).json({ error: 'Date & reason required' });
    await q('INSERT INTO appointments (patient_id,doctor_id,date,reason) VALUES (?,?,?,?)', [patient_id, doctor_id, date, reason]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.patch('/appointments/:id', async (req, res) => {
  try { await q('UPDATE appointments SET status=? WHERE id=?', [req.body.status, req.params.id]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/appointments/:id', async (req, res) => {
  try { await q('DELETE FROM appointments WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ROOMS
app.get('/rooms', async (req, res) => {
  try { res.json(await q('SELECT * FROM rooms ORDER BY number')); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/rooms', async (req, res) => {
  try {
    const { number, type } = req.body;
    if (!number) return res.status(400).json({ error: 'Room number required' });
    await q('INSERT INTO rooms (number,type) VALUES (?,?)', [number, type]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/rooms/:id', async (req, res) => {
  try { await q('DELETE FROM rooms WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// BILLS
app.get('/bills', async (req, res) => {
  try {
    res.json(await q(`SELECT b.id, p.name AS patient, b.amount, b.date, b.paid
      FROM bills b JOIN patients p ON b.patient_id=p.id ORDER BY b.date DESC`));
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/bills', async (req, res) => {
  try {
    const { patient_id, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount required' });
    await q('INSERT INTO bills (patient_id,amount) VALUES (?,?)', [patient_id, amount]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.patch('/bills/:id', async (req, res) => {
  try { await q('UPDATE bills SET paid=? WHERE id=?', [req.body.paid, req.params.id]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/bills/:id', async (req, res) => {
  try { await q('DELETE FROM bills WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.listen(3000, () => console.log('🏥 http://localhost:3000'));