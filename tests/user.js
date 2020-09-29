const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require("../index");
const db = require('../models');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

let token = "Bearer ";
let userId;

describe('User APIs', () => {

    before((done) => {
        // create a fake user and generate the token for usage later
        let user = {
            firstName: "UserAPI",
            lastName: "Test",
            emailAddress: "userapi@test.com",
            password: "abc4567"
        }

        db.User.create(user, function (err, newUser) {
            if (err) {
                return done(err);
            }
            const payload = {
                iss: "PhoenixRising Web Design",
                sub: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            };
            userId = newUser._id;
            token += jwt.sign(payload, process.env.JWT_KEY);
            done();
        });
    });

    after((done) => {
        // clean up the fake user so that the next time the test is run and it is re-created there are no issues
        db.User.deleteOne({ _id: userId }, function (err) {
            done();
        })
    })

    describe('Get All Users', () => {
        it("it should not allow the request without a valid token", done => {
            chai
                .request(server)
                .get("/api/users")
                .send()
                .end((err, users) => {
                    users.should.have.status(401);
                    done();
                });
        });

        it("it should get all users", done => {
            chai
                .request(server)
                .get("/api/users")
                .set("authorization", token)
                .send()
                .end((err, users) => {
                    users.should.have.status(200);
                    users.body.should.be.a("object");
                    users.body.should.have.property("items");
                    users.body.users[0].should.have.property("firstName");
                    users.body.users[0].should.have.property("lastName");
                    users.body.users[0].should.have.property("emailAddress");
                    users.body.users[0].should.not.have.property("password");
                    users.body.users[0].should.have.property("_id");
                    done();
                });
        });
    });

    describe('Get User by Id', () => {
        it("it should not allow the request without a valid token", done => {
            chai
                .request(server)
                .get(`/api/users/${userId}`)
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it("it should get the correct user", done => {
            chai
                .request(server)
                .get(`/api/users/${userId}`)
                .set("authorization", token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("firstName");
                    res.body.firstName.should.equal("UserAPI");
                    res.body.should.have.property("lastName");
                    res.body.lastName.should.equal("Test");
                    res.body.should.have.property("emailAddress");
                    res.body.emailAddress.should.equal("userapi@test.com");
                    done();
                });
        });
    });

    describe('Update User by Id', () => {
        it("it should not allow the request without a valid token", done => {
            let user = {
                firstName: "UserAPI2"
            }
            chai
                .request(server)
                .patch(`/api/users/${userId}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it("it should update the user's first name", done => {
            let user = {
                firstName: "UserAPI2"
            }
            chai
                .request(server)
                .patch(`/api/users/${userId}`)
                .set("authorization", token)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("firstName");
                    res.body.firstName.should.equal(user.firstName);
                    res.body.should.have.property("lastName");
                    res.body.should.have.property("emailAddress");
                    done();
                });
        });

        it("it should update the user's last name", done => {
            let user = {
                lastName: "UserAPI2"
            }
            chai
                .request(server)
                .patch(`/api/users/${userId}`)
                .set("authorization", token)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("firstName");
                    res.body.should.have.property("lastName");
                    res.body.lastName.should.equal(user.lastName);
                    res.body.should.have.property("emailAddress");
                    done();
                });
        });

        it("it should update the user's email address", done => {
            let user = {
                emailAddress: "UserAPI2@test.com"
            }
            chai
                .request(server)
                .patch(`/api/users/${userId}`)
                .set("authorization", token)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.have.property("firstName");
                    res.body.should.have.property("lastName");
                    res.body.should.have.property("emailAddress");
                    res.body.emailAddress.should.equal(user.emailAddress.toLowerCase());
                    done();
                });
        });
    });

    describe("Change Password for a User", () => {
        it("it should not allow the request without a valid token", done => {
            let payload = {
                originalPassword: "abc4567",
                password: "welcome123"
            }

            chai
                .request(server)
                .post(`/api/users/${userId}/changePassword`)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                })

        });

        it("it should return an error if the originalPassword or password are missing", done => {
            let payload = {
                originalPassword: "abc4567"
            }

            chai
                .request(server)
                .post(`/api/users/${userId}/changePassword`)
                .set("authorization", token)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                })

        });

        it("it should return an error if the originalPassword and password are the same", done => {
            let payload = {
                originalPassword: "abc4567",
                password: "abc4567"
            }

            chai
                .request(server)
                .post(`/api/users/${userId}/changePassword`)
                .set("authorization", token)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                })

        });

        // it("it should return an error if the user cannot be found", done => {

        // });

        it("it should return an error if the originalPassword does not match the stored password", done => {
            let payload = {
                originalPassword: "abc4568",
                password: "welcome123"
            }

            chai
                .request(server)
                .post(`/api/users/${userId}/changePassword`)
                .set("authorization", token)
                .send(payload)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                })
        });

        it("it should update the user's password", done => {
            let payload = {
                originalPassword: "abc4567",
                password: "welcome123"
            }

            chai
                .request(server)
                .post(`/api/users/${userId}/changePassword`)
                .set("authorization", token)
                .send(payload)
                .end((err, res) => {
                    // console.log(res.body);
                    // console.log(res);
                    res.should.have.status(200);
                    done();
                })

        })
    });

    describe('Remove User by Id', () => {
        it("it should not allow the request without a valid token", done => {
            chai
                .request(server)
                .delete(`/api/users/${userId}`)
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it("it should successfully delete a valid user.", done => {
            chai
                .request(server)
                .delete(`/api/users/${userId}`)
                .set("authorization", token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })

        });

    });

});