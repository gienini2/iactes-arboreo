/**
 * db.js — SQLite via sql.js (WebAssembly, sense ABI)
 * npm install sql.js
 */
const path      = require('path')
const fs        = require('fs')
const crypto    = require('crypto')
const initSqlJs = require('sql.js')

const DB_DIR  = path.join(__dirname, '..', 'db')
const DB_PATH = path.join(DB_DIR, 'database.db')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

let _db = null


function hashPass(pass, salt) {
  return crypto.pbkdf2Sync(pass, salt, 100000, 64, 'sha512').toString('hex')
}


async function getDb() {
  if (_db) return _db
  const SQL = await initSqlJs()
  _db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database()

  _db.run(`CREATE TABLE IF NOT EXISTS agentes (
    id            TEXT PRIMARY KEY,
    username      TEXT UNIQUE,
    nom           TEXT,
    rol           TEXT,
    activo        INTEGER DEFAULT 1,
    password_hash TEXT,
    salt          TEXT
  )`)

  // Migracions
  try { _db.run(`ALTER TABLE agentes ADD COLUMN username TEXT`) } catch(e) {}
  try { _db.run(`ALTER TABLE agentes ADD COLUMN nom TEXT`) } catch(e) {}

  // Agents inicials — username simple per login fàcil
  const AGENTS = [
    ['001', 'inspector',  'Inspector/a Cap',  'cap',   '001'],
    ['002', 'cabo1',      'Cabo 1',           'cap',   '002'],
    ['003', 'cabo2',      'Cabo 2',           'cap',   '003'],
    ['008', 'admin',      'Administratiu/va', 'admin', '1234'],
    ['010', 'agent010',   'Agent 010',        'agent', '010'],
    ['011', 'agent011',   'Agent 011',        'agent', '011'],
    ['012', 'agent012',   'Agent 012',        'agent', '012'],
    ['013', 'agent013',   'Agent 013',        'agent', '013'],
    ['014', 'agent014',   'Agent 014',        'agent', '014'],
    ['015', 'agent015',   'Agent 015',        'agent', '015'],
    ['020', 'agent020',   'Agent 020',        'agent', '020'],
    ['025', 'agent025',   'Agent 025',        'agent', '025'],
  ]

  for (const [id, username, nom, rol, pin] of AGENTS) {
    const ex = _db.exec(`SELECT id FROM agentes WHERE id='${id}'`)
    if (!ex.length || !ex[0].values.length) {
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex')
      _db.run(
        `INSERT INTO agentes (id,username,nom,rol,activo,password_hash,salt) VALUES (?,?,?,?,1,?,?)`,
        [id, username, nom, rol, hash, salt]
      )
    }
  }
  save()
  return _db
}

function save() {
  if (!_db) return
  fs.writeFileSync(DB_PATH, Buffer.from(_db.export()))
}

async function query(sql, params=[]) {
  const db = await getDb()
  const r = db.exec(sql, params)
  if (!r.length) return []
  return r[0].values.map(row =>
    Object.fromEntries(r[0].columns.map((c,i) => [c, row[i]])))
}

async function run(sql, params=[]) {
  const db = await getDb(); db.run(sql, params); save()
}

async function get(sql, params=[]) {
  return (await query(sql, params))[0] || null
}

getDb().catch(e => console.error('[db] Error:', e))
module.exports = { query, run, get, save, getDb }
