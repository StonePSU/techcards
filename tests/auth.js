const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require("../models");
const server = require("../index");
const should = require('chai').should();

chai.use(chaiHttp);

describe("Authentication", () => {
    before(done => {
        db.User.deleteOne({ emailAddress: "test@test.com" }, err => {
            done();
        })
    });

    describe("/signup", () => {
        it("it should create a new user", done => {
            let user = {
                "firstName": "Test",
                "lastName": "Test",
                "emailAddress": "test@test.com",
                "password": "abc123",
                "phoneNumber": "484-349-3949"
            }


            chai
                .request(server)
                .post("/api/auth/signup")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(201);
                    res.should.be.a('object');
                    res.body.should.have.property('token');
                    done();
                })
        });

        it("it should not create a user with the same email address", done => {
            let user = {
                "firstName": "Test2",
                "lastName": "Test2",
                "emailAddress": "test@test.com",
                "password": "abc123"
            }

            chai
                .request(server)
                .post("/api/auth/signup")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(500);
                    done();
                })
        })

        it("it should not create a user without a  password", done => {
            let user = {
                "firstName": "Test2",
                "lastName": "Test2",
                "emailAddress": "test@test2.com",
            }

            chai
                .request(server)
                .post("/api/auth/signup")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(500);
                    done();
                })
        })

        it("it should not create a user without a first name", done => {
            let user = {
                "lastName": "Test2",
                "emailAddress": "test2@test.com",
                "password": "abc123"
            }

            chai
                .request(server)
                .post("/api/auth/signup")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(500);
                    done();
                })
        })

        it("it should not create a user without a last name", done => {
            let user = {
                "firstName": "Test2",
                "emailAddress": "test@test.com",
                "password": "abc123"
            }

            chai
                .request(server)
                .post("/api/auth/signup")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(500);
                    done();
                })
        })

        it("it should not create a user without an email address", done => {
            let user = {
                "firstName": "Test2",
                "lastName": "Test2",
                "emailAddress": null,
                "password": "abc123"
            }

            chai
                .request(server)
                .post("/api/auth/signup")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(500);
                    done();
                })
        })
    })

    describe("login", () => {
        it("it should authenticate a user with the correct email and password", done => {
            let user = {
                "emailAddress": "test@test.com",
                "password": "abc123"
            }

            chai.request(server)
                .post("/api/auth/login")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(200)
                    res.body.should.have.property("token");
                    done();
                })
        })

        it("it should return authentication failed when an invalid email address is given", done => {
            let user = {
                "emailAddress": "blahblahblah@abc2929292.com",
                "password": "blah39203923"
            }

            chai.request(server)
                .post("/api/auth/login")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(401);
                    done();
                })
        })

        it("it should return authentication failed when an invalid password is given", done => {
            let user = {
                "emailAddress": "test@test.com",
                "password": "blah39203923"
            }

            chai.request(server)
                .post("/api/auth/login")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(401);
                    done();
                })
        })

        it("it should return Bad Request when email is missing", done => {
            let user = {
                "password": "blah39203923"
            }

            chai.request(server)
                .post("/api/auth/login")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(400);
                    done();
                })
        })

        it("it should return Bad Request when password is missing", done => {
            let user = {
                "emailAddress": "test@test.com"
            }

            chai.request(server)
                .post("/api/auth/login")
                .type("form")
                .send(user)
                .end((err, res) => {
                    should.not.exist(err);
                    res.should.have.status(400);
                    done();
                })
        })
    })
})

server.close();

