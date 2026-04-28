const express = require('express');
const router = express.Router();
const favoriteService = require('../services/favoriteService');

/**
 * @swagger
 * /api/favorites/{userId}:
 *   get:
 *     summary: Get all favorite carparks for a user
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's favorite carparks
 *       500:
 *         description: Server error
 */
router.get('/:userId', async (req, res) => {
  try {
    const favorites = await favoriteService.getUserFavorites(req.params.userId);
    res.json({
      success: true,
      count: favorites.length,
      data: favorites
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
 * /api/favorites:
 *   post:
 *     summary: Add a carpark as a favorite for a user
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - carParkNo
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               carParkNo:
 *                 type: string
 *                 description: Carpark ID
 *     responses:
 *       201:
 *         description: Favorite added successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Carpark not found
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { userId, carParkNo } = req.body;

    if (!userId || !carParkNo) {
      return res.status(400).json({
        success: false,
        error: 'userId and carParkNo are required'
      });
    }

    const favorite = await favoriteService.addFavorite(userId, carParkNo);
    res.status(201).json({
      success: true,
      message: 'Favorite added successfully',
      data: favorite
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
 * /api/favorites/{userId}/{carParkNo}:
 *   delete:
 *     summary: Remove a carpark from user's favorites
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: carParkNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Carpark ID
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *       404:
 *         description: Favorite not found
 *       500:
 *         description: Server error
 */
router.delete('/:userId/:carParkNo', async (req, res) => {
  try {
    const result = await favoriteService.removeFavorite(
      req.params.userId,
      req.params.carParkNo
    );
    res.json({
      success: true,
      data: result
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
 * /api/favorites/check/{userId}/{carParkNo}:
 *   get:
 *     summary: Check if a carpark is favorited by a user
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: carParkNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Carpark ID
 *     responses:
 *       200:
 *         description: Favorite status
 *       500:
 *         description: Server error
 */
router.get('/check/:userId/:carParkNo', async (req, res) => {
  try {
    const isFavorited = await favoriteService.isFavorited(
      req.params.userId,
      req.params.carParkNo
    );
    res.json({
      success: true,
      data: { isFavorited }
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
 * /api/favorites/count/{carParkNo}:
 *   get:
 *     summary: Get favorite count for a carpark
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: carParkNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Carpark ID
 *     responses:
 *       200:
 *         description: Favorite count
 *       500:
 *         description: Server error
 */
router.get('/count/:carParkNo', async (req, res) => {
  try {
    const count = await favoriteService.getFavoriteCountForCarpark(req.params.carParkNo);
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
