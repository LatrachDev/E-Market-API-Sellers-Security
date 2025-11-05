const { expect } = require('chai')
const sinon = require('sinon')

const { register, login } = require('../controllers/authController')
const User = require('../models/user')
const hashService = require('../services/hash')

describe('Auth Controller', () => {
  let req, res

  beforeEach(() => {
    req = { body: {} }
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    }
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('register', () => {
    it('returns 400 if email already exists', async () => {
      req.body = {
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'pass123',
      }

      sinon.stub(User, 'findOne').resolves({ _id: 'u1', email: req.body.email })

      await register(req, res)

      expect(res.status.calledWith(400)).to.be.true
      const payload = res.json.firstCall.args[0]
      expect(payload).to.include({ success: false, status: 400 })
      expect(payload.message).to.match(/already taken/i)
    })

    it('creates a new user successfully', async () => {
      req.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        password: 'pass123',
      }

      sinon.stub(User, 'findOne').resolves(null)
      sinon.stub(hashService, 'hashPassword').resolves('hashed-pass')

      // Stub save to assign an _id to the instance and resolve
      sinon.stub(User.prototype, 'save').callsFake(async function () {
        this._id = this._id || 'user123'
        return this
      })

      await register(req, res)

      expect(res.status.calledWith(201)).to.be.true
      const payload = res.json.firstCall.args[0]
      expect(payload).to.have.property('success', true)
      expect(payload).to.have.property('status', 201)
      expect(payload).to.have.nested.property('data.id')
      expect(payload).to.have.nested.property('data.fullname', 'Jane Doe')
      expect(payload).to.have.nested.property('data.email', 'jane@example.com')
      expect(payload).to.have.nested.property('data.role')
    })
  })

  describe('login', () => {
    it('returns 401 if user not found', async () => {
      req.body = { email: 'ghost@example.com', password: 'pass123' }

      sinon.stub(User, 'findOne').resolves(null)

      await login(req, res)

      expect(res.status.calledWith(401)).to.be.true
      const payload = res.json.firstCall.args[0]
      expect(payload).to.have.property('status', 401)
      expect(payload.message).to.match(/invalid email or password/i)
    })

    it('returns 401 if password is invalid', async () => {
      req.body = { email: 'john@example.com', password: 'wrong' }

      sinon
        .stub(User, 'findOne')
        .resolves({ _id: 'u1', email: req.body.email, password: 'hashed' })
      sinon.stub(hashService, 'comparePassword').resolves(false)

      await login(req, res)

      expect(res.status.calledWith(401)).to.be.true
      const payload = res.json.firstCall.args[0]
      expect(payload).to.have.property('status', 401)
      expect(payload.message).to.match(/invalid email or password/i)
    })

    it('returns 200 and jwt on success', async () => {
      req.body = { email: 'john@example.com', password: 'correct' }

      const bcrypt = require('bcrypt')
      sinon.stub(bcrypt, 'compare').resolves(true)

      const user = {
        _id: 'u1',
        fullname: 'John',
        email: req.body.email,
        role: 'user',
        password: 'any',
      }
      sinon.stub(User, 'findOne').resolves(user)

      await login(req, res)

      expect(res.status.calledWith(200)).to.be.true
      const payload = res.json.firstCall.args[0]
      expect(payload).to.have.property('success', true)
      expect(payload).to.have.nested.property('data.jwt').that.is.a('string')
        .and.is.not.empty
      expect(payload).to.have.nested.property(
        'data.user.email',
        'john@example.com'
      )
    })
  })
})
