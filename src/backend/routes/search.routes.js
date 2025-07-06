const express = require('express');
const router = express.Router();
const { search } = require('../controllers/search.controller');
const { autocomplete } = require('../controllers/autocomplete.controller');
const optionalAuth = require('../middlewares/optionalAuth');

router.get('/search', optionalAuth, search);
router.get('/autocomplete', autocomplete);

module.exports = router;
