const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs')
const InvarianError = require('../../exceptions/InvarianError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
    constructor() {
        this._pool = new Pool()
    }

    async addUser({ username, password, fullname }) {
        await this.verifyNewUsername(username)

        const id = `user-${nanoid(16)}`
        const hashedPassword = await bcrypt.hash(password, 10)
        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) throw new InvarianError('User gagal ditambahkan')

        return result.rows[0].id
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT * FROM users WHERE username=$1',
            values: [username],
        }

        const result = await this._pool.query(query)

        if (result.rows.length > 0) throw new InvarianError('Gagal menambahkan user. Username sudah digunakan.')
    }

    async getUserById(userId) {
        console.log(userId)
        const query = {
            text: 'SELECT id, username, fullname FROM users WHERE id=$1',
            values: [userId],
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) throw new NotFoundError('User tidak ditemukan')

        return result.rows[0]
    }
}

module.exports = UsersService