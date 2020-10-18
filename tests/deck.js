// SETUP test
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require("../index");
const db = require('../models');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

let token = "Bearer ";
let userId;
let classId;
let decks;
let cardId;
let deckIds;
let newDeckId;

describe('Deck APIs', () => {

    before(async () => {
        // create a fake user and generate the token for usage later
        let user = {
            firstName: "UserAPI",
            lastName: "Test",
            emailAddress: "userapi@test.com",
            password: "abc4567"
        }

        try {
            let newUser = await db.User.create(user);
            const payload = {
                iss: "PhoenixRising Web Design",
                sub: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            };
            userId = newUser._id;
            token += jwt.sign(payload, process.env.JWT_KEY);

            // create test Class
            let newClass = await db.Class.create({ className: "Unit Test Class", owner: userId });
            classId = newClass._id;

            // create test Decks
            decks = await db.Deck.insertMany([{ deckName: "Unit Test Deck 1", owner: userId }, { deckName: "Unit Test Deck 2", owner: userId }, { deckName: "Unit Test Deck 3", owner: userId }])
            deckIds = decks.map(deck => deck._id);

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        // clean up the fake user so that the next time the test is run and it is re-created there are no issues
        await db.User.deleteOne({ _id: userId })

        await db.Class.deleteOne({ _id: classId });

        await db.Deck.deleteMany({ _id: { $in: deckIds } });
    })


    // CREATE Deck test
    describe("Create Decks", () => {
        // Test unauthorized access
        it("Cannot create deck without authorization", done => {
            chai
                .request(server)
                .post("/api/deck")
                .send({ deckName: "My test deck" })
                .end((err, deck) => {
                    deck.should.have.status(401);
                    done();
                });
        });

        // Test create deck, check class is updated and has correct deck id
        it("Can create deck with authorization", done => {
            chai
                .request(server)
                .post("/api/deck")
                .set("authorization", token)
                .send({ deckName: "My test deck" })
                .end(async (err, deck) => {
                    deck.should.have.status(201);
                    deck.body.should.have.property("deckName");
                    deck.body.should.have.property("owner");
                    newDeckId = deck.body._id;
                    done();
                });
        });

    })

    // GET All decks tests
    describe("Get All Decks", () => {
        // Test unauthorized access
        it("Cannot get all decks without authorization", done => {
            chai
                .request(server)
                .get("/api/deck")
                .send()
                .end((err, newClass) => {
                    newClass.should.have.status(401);
                    done();
                });
        });

        // Test get all decks
        it("Can get all decks with a valid token", done => {
            chai
                .request(server)
                .get("/api/deck")
                .set("authorization", token)
                .send()
                .end((err, decks) => {
                    decks.should.have.status(200);
                    decks.body.should.have.property("items");
                    decks.body.should.have.property("data");
                    decks.body.items.should.equal(decks.body.data.length);
                    done();
                });

        })

        // Test get deck using deckName as filter
        it("Can get all decks with a filter", done => {
            chai
                .request(server)
                .get(`/api/deck?deckName=My test deck`)
                .set("authorization", token)
                .send()
                .end((err, decks) => {
                    decks.should.have.status(200);
                    decks.body.should.have.property("items");
                    decks.body.should.have.property("data");
                    decks.body.items.should.equal(decks.body.data.length);
                    done();
                });

        })

        // Test get deck using expand owner
        it("Can get all decks and expand owner", done => {
            chai
                .request(server)
                .get(`/api/deck?expand=owner`)
                .set("authorization", token)
                .send()
                .end((err, decks) => {
                    decks.should.have.status(200);
                    decks.body.should.have.property("items");
                    decks.body.should.have.property("data");
                    decks.body.items.should.equal(decks.body.data.length);
                    decks.body.data[0].owner.should.have.property("firstName");
                    decks.body.data[0].owner.should.have.property("lastName");
                    decks.body.data[0].owner.should.have.property("emailAddress");
                    done();
                });

        })

    })

    // GET deck by id test
    describe("Get Deck by id", () => {
        // Test unauthorized access
        it("Cannot GET deck without authorization", done => {
            chai
                .request(server)
                .get("/api/deck")
                .send()
                .end((err, newClass) => {
                    newClass.should.have.status(401);
                    done();
                });
        });

        // Test get deck by id
        it("Can GET a single deck by id", done => {
            chai
                .request(server)
                .get(`/api/deck/${decks[0]._id}`)
                .set("authorization", token)
                .send()
                .end((err, decks) => {
                    decks.should.have.status(200);
                    decks.body.should.have.property("deckName");
                    decks.body.should.have.property("owner");
                    done();
                });

        })

        // Test return 404 if deck not found
        it("Return 404 if deck not found", done => {
            chai
                .request(server)
                .get(`/api/deck/999999999999999999999999`)
                .set("authorization", token)
                .send()
                .end((err, updated) => {
                    updated.should.have.status(404);
                    done();
                });
        });

        // Test get deck by id using expand owner
        it("Can GET a single deck by id", done => {
            chai
                .request(server)
                .get(`/api/deck/${decks[0]._id}?expand=owner`)
                .set("authorization", token)
                .send()
                .end((err, decks) => {
                    decks.should.have.status(200);
                    decks.body.should.have.property("deckName");
                    decks.body.should.have.property("owner");
                    decks.body.owner.should.have.property("firstName");
                    decks.body.owner.should.have.property("lastName");
                    decks.body.owner.should.have.property("emailAddress");
                    done();
                });

        })

    })

    // UPDATE deck by id test
    describe("Update Deck", () => {
        // Test unauthorized access
        it("Cannot update deck without authorization", done => {
            chai
                .request(server)
                .put(`/api/deck/${decks[0]._id}`)
                .send()
                .end((err, newClass) => {
                    newClass.should.have.status(401);
                    done();
                });
        });

        // Test update deck providing invalid id
        it("Return 404 if deck cannot be found given an id", done => {
            chai
                .request(server)
                .put(`/api/deck/999999999999999999999999`)
                .set("authorization", token)
                .send({ deckName: "My Updated Deck" })
                .end((err, updated) => {
                    updated.should.have.status(404);
                    done();
                });
        });


        // Test update deck providing valid id
        it("Can update deck", done => {
            chai
                .request(server)
                .put(`/api/deck/${decks[0]._id}`)
                .set("authorization", token)
                .send({ deckName: "My Updated Deck" })
                .end((err, updated) => {
                    updated.should.have.status(200);
                    updated.body.should.have.property("deckName");
                    updated.body.deckName.should.equal("My Updated Deck");
                    done();
                });
        });

    })

    describe("Working with Cards in a deck", () => {
        it("It should create multiple cards in a deck", done => {
            chai
                .request(server)
                .post(`/api/deck/${decks[0]._id}/card`)
                .set("authorization", token)
                .send({
                    cards: [
                        {
                            question: "what's my favorite color",
                            answer: "red"
                        },
                        {
                            question: "what was my dog's name?",
                            answer: "Benson"
                        }
                    ]
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('cards');
                    res.body.cards.should.be.an('array');
                    res.body.cards.should.have.length(2);
                    cardId = res.body.cards[0]._id;
                    done();
                })
        })
    })

    // DELETE deck by id test
    describe("Delete Deck", () => {
        // Test unauthorized access
        it("Cannot delete deck without authorization", done => {
            chai
                .request(server)
                .delete(`/api/deck/${decks[0]._id}`)
                .send()
                .end((err, deck) => {
                    deck.should.have.status(401);
                    done();
                });
        });

        // Test delete deck providing invalid id
        it("Return 404 if deck cannot be found", done => {
            chai
                .request(server)
                .delete(`/api/deck/999999999999999999999999`)
                .set("authorization", token)
                .send()
                .end((err, deck) => {
                    deck.should.have.status(404);
                    done();
                });
        });

        // Test delete deck providing valid id, validate deck is removed from class
        it("Can delete deck and corresponding class has deck removed", done => {
            chai
                .request(server)
                .delete(`/api/deck/${newDeckId}`)
                .set("authorization", token)
                .send()
                .end((err, deck) => {
                    deck.should.have.status(200);
                    done();
                });
        });

    });


});


