// var API = require('./api.js');
require('dotenv').load();

var should = require('should');
var expect = require('chai').expect;
var request = require('supertest');
var app = require('./server.js');

describe('API functions', function(){
	describe('/api/staff', function(){

		it('should return staff information', function(done){
			this.timeout(10000);
			request(app)
				.get('/api/staff/?name=Nilsson%20H%20Dr&department=Computer%20Science')
				.expect(200)
				.end(function(err, res){
					res.body.should.have.property('short');
					res.body.should.have.property('department');
					res.body.should.have.property('email');
					res.body.should.have.property('username');
					res.body.should.have.property('_id');

					res.body.short.should.equal('Nilsson H Dr');
					res.body.email.should.equal('henrik.nilsson@nottingham.ac.uk');
					res.body.username.should.equal('psznhn');
					done();
				});
		});

		it('should 404', function(done){
			this.timeout(10000);
			request(app)
				.get('/api/staff/?name=Dr%20asdasdasd&department=Computer%20Science')
				.expect(404)
				.end(done);
		});

		it('should 404 and not fail', function(done){
			this.timeout(10000);
			request(app)
				.get('/api/staff/?name=Dr%20asdasdasd')
				.expect(404)
				.end(done);
		});
	});

	describe('/api/room', function(){
		it('should find C3', function(done){
			request(app)
				.get('/api/room/JC-EXCHGE-C3')
				.expect(200)
				.end(function(err, res){
					res.body.should.have.property('code');
					res.body.should.have.property('name');
					res.body.should.have.property('_id');

					res.body.code.should.equal('JC-EXCHGE');
					res.body.name.should.equal('Jubilee Campus The Exchange Building C3');
					done();
				});
		});
	});

	describe('/api/module', function(){
		it('should find G52CPP', function(done){
			request(app)
				.get('/api/module/G52CPP')
				.expect(200)
				.end(function(err, res){
					res.body.should.be.an.instanceOf(Array);
					res.body.length.should.equal(5);
					done();
				});
		});

		it('should not find NOEXIST', function(done){
			request(app)
				.get('/api/module/NOEXIST')
				.expect(404)
				.end(function(err, res){
					res.body.error.should.equal('Not found');
					done();
				});
		});
	});

	describe('/api/courses', function(){
		//TODO: Add tests for authorised requests
		describe('/modules/:username', function(){
			it('should be unauthorized', function(done){
				request(app)
					.get('/api/courses/modules/psyrs6')
					.expect(401)
					.end(function(err, res){
						done();
					});
			});
		});

		describe('/modules/:id', function(){
			it('should fetch 0219123', function(done){
				request(app)
					.get('/api/courses/0219123')
					.expect(200)
					.end(function(err, res){
						done();
					});
			});

			it('should not find 123', function(done){
				request(app)
					.get('/api/courses/123')
					.expect(404)
					.end(function(err, res){
						done();
					});
			});
		});
	});
	//TODO: Add tests for verification
});
