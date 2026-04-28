const express = require('express');
const router = express.Router();
const carparkService = require('../services/carparkService');

/**
 * @swagger
 * /api/carparks:
 *   get:
 *     summary: Get all carparks with optional filters
 *     tags: [Carparks]
 *     parameters:
 *       - in: query
 *         name: freeParking
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by free parking
 *       - in: query
 *         name: nightParking
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by night parking
 *       - in: query
 *         name: minHeight
 *         schema:
 *           type: number
 *         description: Minimum vehicle height requirement (in meters)
 *     responses:
 *       200:
 *         description: List of carparks
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const carparks = await carparkService.getAllCarparks(req.query);
    res.json({
      success: true,
      count: carparks.length,
      data: carparks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/carparks/{carParkNo}:
 *   get:
 *     summary: Get a specific carpark by ID
 *     tags: [Carparks]
 *     parameters:
 *       - in: path
 *         name: carParkNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Carpark ID
 *     responses:
 *       200:
 *         description: Carpark details
 *       404:
 *         description: Carpark not found
 *       500:
 *         description: Server error
 */
router.get('/:carParkNo', async (req, res) => {
  try {
    const carpark = await carparkService.getCarparkById(req.params.carParkNo);
    res.json({
      success: true,
      data: carpark
    });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/carparks/filter/free-parking:
 *   get:
 *     summary: Get carparks with free parking
 *     tags: [Carparks]
 *     responses:
 *       200:
 *         description: List of carparks with free parking
 *       500:
 *         description: Server error
 */
router.get('/filter/free-parking', async (req, res) => {
  try {
    const carparks = await carparkService.getFreeParkingCarparks();
    res.json({
      success: true,
      count: carparks.length,
      data: carparks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/carparks/filter/night-parking:
 *   get:
 *     summary: Get carparks with night parking
 *     tags: [Carparks]
 *     responses:
 *       200:
 *         description: List of carparks with night parking
 *       500:
 *         description: Server error
 */
router.get('/filter/night-parking', async (req, res) => {
  try {
    const carparks = await carparkService.getNightParkingCarparks();
    res.json({
      success: true,
      count: carparks.length,
      data: carparks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/carparks/filter/height/{minHeight}:
 *   get:
 *     summary: Get carparks available for a specific vehicle height
 *     tags: [Carparks]
 *     parameters:
 *       - in: path
 *         name: minHeight
 *         required: true
 *         schema:
 *           type: number
 *         description: Minimum vehicle height in meters
 *     responses:
 *       200:
 *         description: List of carparks available for the height
 *       500:
 *         description: Server error
 */
router.get('/filter/height/:minHeight', async (req, res) => {
  try {
    const carparks = await carparkService.getCarparksAvailableForHeight(req.params.minHeight);
    res.json({
      success: true,
      count: carparks.length,
      data: carparks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/carparks/stats/count:
 *   get:
 *     summary: Get total number of carparks
 *     tags: [Carparks]
 *     responses:
 *       200:
 *         description: Total carpark count
 *       500:
 *         description: Server error
 */
router.get('/stats/count', async (req, res) => {
  try {
    const count = await carparkService.getTotalCarparkCount();
    res.json({
      success: true,
      data: { totalCarparks: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
