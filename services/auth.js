/**
 * auth.js — Login per usuari/contrasenya (sql.js async)
 * Accepta tant id numèric (001) com nom d'usuari (admin, agent01...)
 */
const crypto = require('crypto')
const db     = require('./db')

async function login(userInput, pass) {
  // Buscar per id o per nom d'usuari
  const row = await db.get(
    `SELECT id, nom, rol, activo, password_hash, salt, username
     FROM agentes
     WHERE id = ? OR username = ? OR lower(nom) = lower(?)`,
    [userInput, userInput, userInput]
  )

  if (!row)        return { ok: false, error: 'Usuari no autoritzat' }
  if (!row.activo) return { ok: false, error: 'Usuari desactivat' }

  const hash = crypto.pbkdf2Sync(pass, row.salt, 100000, 64, 'sha512').toString('hex')
  if (hash !== row.password_hash) return { ok: false, error: 'Contrasenya incorrecta' }

  return { 
    ok: true, 
    user: {
      tip: row.id,
      nom: row.nom || row.id,
      rol: row.rol
    }
}
}

async function getAgents() {
  const rows = await db.query(
    `SELECT id, nom, rol FROM agentes WHERE activo = 1 ORDER BY id`
  )
  return rows.map(r => ({ num: r.id, nom: r.nom || r.id, rol: r.rol }))
}

module.exports = { login, getAgents }
