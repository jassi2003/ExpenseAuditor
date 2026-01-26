
const express = require("express");
const router = express.Router();

const { streamExchangeRates } = require("../controllers/rates.controller");
const {streamInrRates}=require("../controllers/employee.rate.controller")

// SSE endpoint
router.get("/rates/stream", streamExchangeRates);
router.get("/rates/inr-stream",streamInrRates)
module.exports = router;
