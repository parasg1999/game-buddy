const router = require('express').Router();

const Room = require('../models/room');
const User = require('../models/user');
const { isAdminLoggedIn, isUserLoggedIn } = require('../utils/ensureAuth');
const { sendText } = require('../config/otpService');

router.get('/', (req, res) => {
    Room.find()
        .then(rooms => res.send(rooms, { user: req.user }))
        .catch(err => res.status(400).send({ err }))
});

router.get('/create', isAdminLoggedIn, (req, res) => {
    res.render('createRoom', { user: req.user });
})

router.post('/create', isAdminLoggedIn, (req, res) => {
    const { name, typeOfSquad, map, matchType, datetime, entryFee, killReward, firstReward, secondReward } = req.body;
    console.log(req.body);

    const teamObj = {
        "Solo": 100,
        "Duo": 50,
        "Squad": 25,
    }

    const newRoom = new Room({
        name,
        typeOfSquad,
        map,
        matchType,
        datetime,
        entryFee,
        firstReward,
        secondReward,
        killReward,
        teams: teamObj[typeOfSquad],
    })

    newRoom.save()
        .then(room => res.redirect('/'))
        .catch(err => res.status(400).send({ err }))
})

router.get('/sendMessage/:id', isAdminLoggedIn, (req, res) => {
    const { id } = req.params;
    Room.findOne({ _id: id })
        .then(room => {
            if (!room) { }
            else {
                return res.render('sendMessage', { user: req.user, room })
            }
        })
        .catch(err => res.status(400).send({ err }))
    // TODO: FIX IT
});

router.post('/sendMessage/:id', isAdminLoggedIn, (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    Room.findOne({ _id: id })
        .then(room => {
            if (!room) { }
            else {
                return User.find({ _id: { $in: room.players } })
            }
        })
        .then(users => {
            users.forEach(user => {
                sendText(`+${user.phone}`, message);
            });
            return res.redire('sendMessage', { user: req.user })
        })
        .catch(err => res.status(400).send({ err }))
    // TODO: FIX IT
})


router.get('/:id', isUserLoggedIn, (req, res) => {
    const { id } = req.params;
    Room.findOne({ _id: id })
        .then(room => res.render('tournamentDet', { room, user: req.user }))
        .catch(err => res.status(400).send({ err }))
})

module.exports = router;