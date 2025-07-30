const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/dietary-restrictions - Get all available dietary restrictions
router.get('/dietary-restrictions', async (req, res) => {
  try {
    const restrictions = await prisma.dietaryRestriction.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({ restrictions });
  } catch (error) {
    console.error('Get dietary restrictions error:', error);
    res.status(500).json({ message: 'Failed to get dietary restrictions' });
  }
});

// GET /api/users/allergies - Get all available allergies
router.get('/allergies', async (req, res) => {
  try {
    const allergies = await prisma.allergy.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({ allergies });
  } catch (error) {
    console.error('Get allergies error:', error);
    res.status(500).json({ message: 'Failed to get allergies' });
  }
});

// GET /api/users/stats - Get user statistics (favorite recipes count, shopping lists, etc.)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [favoriteRecipesCount, shoppingListsCount, totalRecipesCreated] = await Promise.all([
      prisma.recipe.count({
        where: {
          favoritedBy: {
            some: { id: req.user.id }
          }
        }
      }),
      prisma.shoppingList.count({
        where: { userId: req.user.id }
      }),
      // If we add recipe creation by users later
      prisma.recipe.count({
        where: {
          // Add createdBy field to Recipe model if needed
          // createdBy: req.user.id
        }
      })
    ]);

    const stats = {
      favoriteRecipes: favoriteRecipesCount,
      shoppingLists: shoppingListsCount,
      recipesCreated: totalRecipesCreated || 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to get user statistics' });
  }
});

module.exports = router; 