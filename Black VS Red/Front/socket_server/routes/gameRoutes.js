const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.get('/make-group', (req, res) => {
  const groupId = uuidv4();
  res.json({ groupId });
});

module.exports = router;