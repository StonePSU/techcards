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
let deckId;
let cards;

describe('Card APIs', () => {

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
            let newClass = await db.Class.create({ className: "Unit Test Class", ownerId: userId });
            classId = newClass._id;

            // create test Decks
            decks = await db.Deck.insertMany([{ deckName: "Unit Test Deck 1", ownerId: userId, classId }, { deckName: "Unit Test Deck 2", ownerId: userId, classId }, { deckName: "Unit Test Deck 3", ownerId: userId, classId }])

            // create test Cards
            cards = await db.Card.insertMany([{
                question: "What is 2 + 2?",
                answer: "4",
                ownerId: userId,
                deckId: decks[0]._id
            },
            {
                question: "What is 3 X 3?",
                answer: "9",
                ownerId: userId,
                deckId: decks[0]._id
            }])

        } catch (err) {
            console.log(err);
        }
    });

    after(async () => {
        // clean up the fake user so that the next time the test is run and it is re-created there are no issues
        await db.User.deleteOne({ _id: userId })

        await db.Class.deleteOne({ _id: classId });

        await db.Deck.deleteMany({ classId });

        await db.Card.deleteMany({ deckId: decks[0]._id })
    })


    // CREATE Deck test
    describe("Create Cards", () => {
        // Test unauthorized access
        it("Cannot create Card without authorization", done => {
            chai
                .request(server)
                .post("/api/deck")
                .send({ question: "What's your favorite color", answer: "Red", deckId: "12345", ownerId: userId })
                .end((err, card) => {
                    card.should.have.status(401);
                    done();
                });
        });

        // Test create deck, check class is updated and has correct deck id
        it("Can create card with authorization", async () => {
            chai
                .request(server)
                .post("/api/card")
                .set("authorization", token)
                .send({ question: "Whats your favorite color", answer: "Red", deckId: decks[0]._id })
                .end(async (err, card) => {
                    card.should.have.status(201);
                    card.body.should.have.property("question");
                    card.body.should.have.property("answer");
                    card.body.should.have.property("ownerId");
                    card.body.should.have.property("deckId");

                    // make sure Deck has the corresponding card id
                    let pDeck = await db.Deck.findById(decks[0]._id);
                    pDeck.should.be.an('object');
                    pDeck.should.have.property("_id");
                    pDeck.should.have.property("cards");
                    pDeck.cards.should.be.an('array');
                    pDeck.cards.should.not.be.empty;


                    //done();
                });
        });

    })

    // GET All decks tests
    describe("Get All Cards", () => {
        // Test unauthorized access
        it("Cannot get all cards without authorization", done => {
            chai
                .request(server)
                .get("/api/card")
                .send()
                .end((err, newDeck) => {
                    newDeck.should.have.status(401);
                    done();
                });
        });

        // Test get all decks
        it("Can get all cards with a valid token", done => {
            chai
                .request(server)
                .get("/api/card")
                .set("authorization", token)
                .send()
                .end((err, cards) => {
                    cards.should.have.status(200);
                    cards.body.should.have.property("items");
                    cards.body.should.have.property("data");
                    cards.body.items.should.equal(cards.body.data.length);
                    done();
                });

        })

        // Test get deck using deckName as filter
        it("Can get all cards with a filter", done => {
            chai
                .request(server)
                .get(`/api/card?question=What's your favorite color`)
                .set("authorization", token)
                .send()
                .end((err, cards) => {
                    cards.should.have.status(200);
                    cards.body.should.have.property("items");
                    cards.body.should.have.property("data");
                    cards.body.items.should.equal(cards.body.data.length);
                    done();
                });

        })

        // Test get deck using expand ownerId
        it("Can get all cards and expand owner", done => {
            chai
                .request(server)
                .get(`/api/card?expand=ownerId`)
                .set("authorization", token)
                .send()
                .end((err, cards) => {
                    cards.should.have.status(200);
                    cards.body.should.have.property("items");
                    cards.body.should.have.property("data");
                    cards.body.items.should.equal(cards.body.data.length);
                    cards.body.data[0].ownerId.should.have.property("firstName");
                    cards.body.data[0].ownerId.should.have.property("lastName");
                    cards.body.data[0].ownerId.should.have.property("emailAddress");
                    done();
                });

        })

    })

    // GET deck by id test
    describe("Get Card by id", () => {
        // Test unauthorized access
        it("Cannot GET card without authorization", done => {
            chai
                .request(server)
                .get("/api/card")
                .send()
                .end((err, newDeck) => {
                    newDeck.should.have.status(401);
                    done();
                });
        });

        // Test get deck by id
        it("Can GET a single card by id", done => {
            chai
                .request(server)
                .get(`/api/card/${cards[0]._id}`)
                .set("authorization", token)
                .send()
                .end((err, cards) => {
                    cards.should.have.status(200);
                    cards.body.should.have.property("question");
                    cards.body.should.have.property("answer");
                    cards.body.should.have.property("ownerId");
                    cards.body.should.have.property("deckId");
                    done();
                });

        })

        // Test return 404 if deck not found
        it("Return 404 if card not found", done => {
            chai
                .request(server)
                .get(`/api/card/999999999999999999999999`)
                .set("authorization", token)
                .send()
                .end((err, updated) => {
                    updated.should.have.status(404);
                    done();
                });
        });

        // Test get deck by id using expand ownerId
        it("Can GET a single card by id", done => {
            chai
                .request(server)
                .get(`/api/card/${cards[0]._id}?expand=ownerId`)
                .set("authorization", token)
                .send()
                .end((err, cards) => {
                    cards.should.have.status(200);
                    cards.body.should.have.property("question");
                    cards.body.should.have.property("answer");
                    cards.body.should.have.property("ownerId");
                    cards.body.should.have.property("deckId");
                    cards.body.ownerId.should.have.property("firstName");
                    cards.body.ownerId.should.have.property("lastName");
                    cards.body.ownerId.should.have.property("emailAddress");
                    done();
                });

        })

    })

    // UPDATE deck by id test
    describe("Update Card", () => {
        // Test unauthorized access
        it("Cannot update card without authorization", done => {
            chai
                .request(server)
                .put(`/api/card/${cards[0]._id}`)
                .send()
                .end((err, updated) => {
                    updated.should.have.status(401);
                    done();
                });
        });

        // Test update deck providing invalid id
        it("Return 404 if card cannot be found given an id", done => {
            chai
                .request(server)
                .put(`/api/card/999999999999999999999999`)
                .set("authorization", token)
                .send({ question: "My Updated card" })
                .end((err, updated) => {
                    updated.should.have.status(404);
                    done();
                });
        });


        // Test update deck providing valid id
        it("Can update card", done => {
            chai
                .request(server)
                .put(`/api/card/${cards[0]._id}`)
                .set("authorization", token)
                .send({ question: "My Updated card" })
                .end((err, updated) => {
                    updated.should.have.status(200);
                    updated.body.should.have.property("question");
                    updated.body.question.should.equal("My Updated card");
                    done();
                });
        });

    })

    // DELETE deck by id test
    describe("Delete card", () => {
        // Test unauthorized access
        it("Cannot delete card without authorization", done => {
            chai
                .request(server)
                .delete(`/api/card/${cards[0]._id}`)
                .send()
                .end((err, card) => {
                    card.should.have.status(401);
                    done();
                });
        });

        // Test delete deck providing invalid id
        it("Return 404 if card cannot be found", done => {
            chai
                .request(server)
                .delete(`/api/card/999999999999999999999999`)
                .set("authorization", token)
                .send()
                .end((err, card) => {
                    card.should.have.status(404);
                    done();
                });
        });

        // Test delete deck providing valid id, validate deck is removed from class
        it("Can delete card and corresponding card has card removed", done => {
            chai
                .request(server)
                .delete(`/api/card/${cards[0]._id}`)
                .set("authorization", token)
                .send()
                .end((err, card) => {
                    card.should.have.status(200);
                    done();
                });
        });

    })
});


