const winston = require('winston')
const { requiresLogin, requiresAdmin } = require('./middlewares/authorization')
const users = require('../app/users')

module.exports = (app, passport, pool) => {
	app.post('/api/login', passport.authenticate('local'), users.login)
	app.get('/api/logout', users.logout)
	app.get('/api/ping', requiresLogin, users.ping)

	app.get('/admin/login', (req, res) => {
		res.render('login')
	})

	app.post('/admin/login', passport.authenticate('local', { failureRedirect: '/admin/login' }), (req, res) => {
		if(req.user.type === 'admin') {
			res.redirect('/admin/panel')
		} else {
			res.redirect('/admin/login')
		}
	})

	app.get('/admin/panel', requiresAdmin, (req, res) => {
		res.render('admin-panel')
	})

	app.use(function (err, req, res, next) {
		if (err.message && (~err.message.indexOf('not found'))) {
			return next()
		}

		winston.error(err.stack)

		return res.status(500).json({error: 'Error on backend occurred.'})
	})

	app.use(function (req, res) {
		const payload = {
			url: req.originalUrl,
			error: 'Not found'
		}
		if (req.accepts('json')) return res.status(404).json(payload)

		res.status(404).render('404', payload)
	})
}

