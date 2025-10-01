const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Routes de réservations - En développement',
    user: req.user,
    timestamp: new Date().toISOString(),
    developer: 'msylla01'
  });
});

module.exports = router;
