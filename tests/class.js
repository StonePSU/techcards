const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require("../index");
const db = require('../models');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

let token = "Bearer ";
let userId;
let classObj = {
    className: "NPM TEST CLASS"
}
let classId = null;
var deckCreatedId = null;

describe('Class APIs', () => {

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
            if (err) console.log(err);

            db.Deck.deleteOne({ _id: deckCreatedId }, function (err) {
                if (err) console.log(err);
                done();
            })
        })


    })



    describe("Create Classes", () => {
        it("Cannot create class without authorization", done => {
            chai
                .request(server)
                .post("/api/class")
                .send(classObj)
                .end((err, newClass) => {
                    newClass.should.have.status(401);
                    done();
                });
        });

        it("Can create a new class", done => {
            chai
                .request(server)
                .post("/api/class")
                .set("authorization", token)
                .send(classObj)
                .end((err, newClass) => {
                    newClass.should.have.status(201);
                    newClass.body.should.have.property("_id");
                    newClass.body.should.have.property("className");
                    newClass.body.should.have.property("owner");

                    classId = newClass.body._id;
                    done();
                })
        })
    })

    describe("Get Classes", () => {
        it("Cannot get a class without authorization", done => {
            chai
                .request(server)
                .get("/api/class")
                .send()
                .end((err, classes) => {
                    classes.should.have.status(401);
                    done();
                });
        });

        it("Can get all classes", done => {
            chai
                .request(server)
                .get("/api/class")
                .set("authorization", token)
                .send()
                .end((err, classes) => {
                    classes.should.have.status(200);
                    classes.body.should.be.a('object');
                    classes.body.should.have.property("items");
                    classes.body.should.have.property("data")
                    classes.body.data.should.be.a("array");
                    classes.body.items.should.equal(classes.body.data.length);
                    if (classes.body.items > 0) {
                        classes.body.data[0].should.have.property("className");
                        classes.body.data[0].should.have.property("owner")
                    }
                    done();
                });
        });

        it("Can filter classes by className", done => {
            chai
                .request(server)
                .get(`/api/class?className=${classObj.className}`)
                .set("authorization", token)
                .send()
                .end((err, classes) => {
                    classes.should.have.status(200);
                    classes.body.should.have.property("items");
                    classes.body.should.have.property("data");
                    if (classes.body.items > 0) {
                        classes.body.data[0].className.should.equal(classObj.className);
                    }

                    done();
                })
        });

        it("Can expand a document reference when getting all classes", done => {
            chai
                .request(server)
                .get(`/api/class?expand=owner`)
                .set("authorization", token)
                .send()
                .end((err, classes) => {
                    classes.should.have.status(200);
                    classes.body.should.have.property("data");
                    classes.body.should.have.property("items");
                    classes.body.data[0].should.have.property("owner")
                    classes.body.data[0].owner.should.have.property("firstName")
                    classes.body.data[0].owner.should.have.property("lastName")
                    classes.body.data[0].owner.should.have.property("emailAddress")
                    done();
                })
        });

        it("Can get a single class by id", done => {
            chai
                .request(server)
                .get(`/api/class/${classId}`)
                .set("authorization", token)
                .send()
                .end((err, classes) => {
                    classes.should.have.status(200);
                    classes.body.should.have.property("owner");
                    classes.body.should.have.property("className");
                    classes.body.should.have.property("decks");
                    done();
                })
        });

        it("Can get a single class by id and expand owner id", done => {
            chai
                .request(server)
                .get(`/api/class/${classId}?expand=owner`)
                .set("authorization", token)
                .send()
                .end((err, classes) => {
                    classes.should.have.status(200);
                    classes.body.should.have.property("owner");
                    classes.body.should.have.property("className");
                    classes.body.should.have.property("decks");
                    classes.body.owner.should.have.property("firstName");
                    classes.body.owner.should.have.property("lastName");
                    classes.body.owner.should.have.property("emailAddress");
                    done();
                })
        })
    })

    describe("Update Classes", () => {
        it("Cannot update a class without a token", done => {
            chai
                .request(server)
                .put(`/api/class/`)
                .send({ className: "my updated class name" })
                .end((err, classes) => {
                    classes.should.have.status(401);
                    done();
                })
        });

        it("Can update the class name", done => {
            chai
                .request(server)
                .put(`/api/class/${classId}`)
                .set('authorization', token)
                .send({ className: "updated class in JS unit test" })
                .end((err, classes) => {
                    classes.should.have.status(200);
                    classes.body.should.have.property("_id");
                    classes.body.should.have.property("className");
                    classes.body.className.should.equal("updated class in JS unit test");
                    done();
                })
        });
    });

    describe("Dealing with Decks through classes", () => {
        it("Can create a class through a deck", (done) => {
            chai
                .request(server)
                .post(`/api/class/${classId}/deck`)
                .set("authorization", token)
                .send({ deckName: "TEST DECK" })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property("decks");
                    res.body.decks.should.have.length(1);
                    deckCreatedId = res.body.decks[0];
                    done();
                })
        })

        it("Can remove a deck from a class", done => {
            chai
                .request(server)
                .delete(`/api/class/${classId}/deck/${deckCreatedId}`)
                .set("authorization", token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("decks");
                    res.body.decks.should.have.length(0);
                    done();
                })
        })
    })

    describe("Delete Class", () => {
        it("Cannot delete a class without a token", done => {
            chai
                .request(server)
                .delete(`/api/class/${classId}`)
                .send()
                .end((err, classObj) => {
                    classObj.should.have.status(401);
                    done();
                })
        });

        it("Cannot delete class with invalid id", done => {
            chai
                .request(server)
                .delete("/api/class/599999999999946994999999")
                .set("authorization", token)
                .send()
                .end((err, classObj) => {
                    classObj.should.have.status(404);
                    done();
                })
        });

        it("Can delete class with valid id", done => {
            chai
                .request(server)
                .delete(`/api/class/${classId}`)
                .set("authorization", token)
                .send()
                .end((err, classObj) => {
                    classObj.should.have.status(200);
                    done();
                })
        })
    })



});