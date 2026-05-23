const express = require('express');
const {listUsers, getUserById, createUser, updateUser, deleteUser, satsUser} = require('../controllers/usersCon');

const router = express.Router();

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/:id/stats', satsUser);

module.exports = router;