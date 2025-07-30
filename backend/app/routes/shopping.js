const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate, shoppingListCreateSchema } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/shopping/lists - Get user's shopping lists
router.get('/lists', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const shoppingLists = await prisma.shoppingList.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true
              }
            }
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    const totalCount = await prisma.shoppingList.count({
      where: { userId: req.user.id }
    });

    res.json({
      shoppingLists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get shopping lists error:', error);
    res.status(500).json({ message: 'Failed to get shopping lists' });
  }
});

// GET /api/shopping/lists/:id - Get single shopping list
router.get('/lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true
              }
            }
          },
          orderBy: [
            { ingredient: { category: 'asc' } },
            { ingredient: { name: 'asc' } }
          ]
        }
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    res.json({ shoppingList });

  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({ message: 'Failed to get shopping list' });
  }
});

// POST /api/shopping/lists - Create new shopping list
router.post('/lists', authenticateToken, validate(shoppingListCreateSchema), async (req, res) => {
  try {
    const { name, items = [] } = req.body;

    const shoppingList = await prisma.shoppingList.create({
      data: {
        name,
        userId: req.user.id,
        items: {
          create: items.map(item => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes
          }))
        }
      },
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Shopping list created successfully',
      shoppingList
    });

  } catch (error) {
    console.error('Create shopping list error:', error);
    res.status(500).json({ message: 'Failed to create shopping list' });
  }
});

// POST /api/shopping/generate-from-recipes - Generate shopping list from selected recipes
router.post('/generate-from-recipes', authenticateToken, async (req, res) => {
  try {
    const { recipeIds, servingAdjustments = {}, listName } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ message: 'Recipe IDs array is required' });
    }

    // Get recipes with their ingredients
    const recipes = await prisma.recipe.findMany({
      where: {
        id: { in: recipeIds }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    if (recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found' });
    }

    // Consolidate ingredients across all recipes
    const consolidatedIngredients = new Map();

    recipes.forEach(recipe => {
      const servingMultiplier = servingAdjustments[recipe.id] 
        ? servingAdjustments[recipe.id] / recipe.servings 
        : 1;

      recipe.ingredients.forEach(recipeIngredient => {
        const ingredientId = recipeIngredient.ingredientId;
        const adjustedQuantity = recipeIngredient.quantity * servingMultiplier;

        if (consolidatedIngredients.has(ingredientId)) {
          const existing = consolidatedIngredients.get(ingredientId);
          
          // Check if units are compatible for consolidation
          if (existing.unit === recipeIngredient.unit) {
            existing.quantity += adjustedQuantity;
          } else {
            // Different units - create separate entries
            const key = `${ingredientId}_${recipeIngredient.unit}`;
            consolidatedIngredients.set(key, {
              ingredientId,
              ingredient: recipeIngredient.ingredient,
              quantity: adjustedQuantity,
              unit: recipeIngredient.unit,
              notes: `From ${recipe.title}`
            });
            return;
          }
        } else {
          consolidatedIngredients.set(ingredientId, {
            ingredientId,
            ingredient: recipeIngredient.ingredient,
            quantity: adjustedQuantity,
            unit: recipeIngredient.unit,
            notes: `From ${recipe.title}`
          });
        }
      });
    });

    // Create shopping list
    const generatedListName = listName || `Shopping List - ${new Date().toLocaleDateString()}`;
    
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: generatedListName,
        userId: req.user.id,
        items: {
          create: Array.from(consolidatedIngredients.values()).map(item => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes
          }))
        }
      },
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true
              }
            }
          },
          orderBy: [
            { ingredient: { category: 'asc' } },
            { ingredient: { name: 'asc' } }
          ]
        }
      }
    });

    res.status(201).json({
      message: 'Shopping list generated successfully',
      shoppingList,
      recipesUsed: recipes.map(r => ({ id: r.id, title: r.title }))
    });

  } catch (error) {
    console.error('Generate shopping list error:', error);
    res.status(500).json({ message: 'Failed to generate shopping list' });
  }
});

// PUT /api/shopping/lists/:id - Update shopping list
router.put('/lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, completed } = req.body;

    // Check if shopping list exists and belongs to user
    const existingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (completed !== undefined) updateData.completed = completed;

    const shoppingList = await prisma.shoppingList.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Shopping list updated successfully',
      shoppingList
    });

  } catch (error) {
    console.error('Update shopping list error:', error);
    res.status(500).json({ message: 'Failed to update shopping list' });
  }
});

// DELETE /api/shopping/lists/:id - Delete shopping list
router.delete('/lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if shopping list exists and belongs to user
    const existingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    await prisma.shoppingList.delete({
      where: { id }
    });

    res.json({ message: 'Shopping list deleted successfully' });

  } catch (error) {
    console.error('Delete shopping list error:', error);
    res.status(500).json({ message: 'Failed to delete shopping list' });
  }
});

// PUT /api/shopping/items/:itemId - Update shopping list item
router.put('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, unit, purchased, notes } = req.body;

    // Check if item exists and belongs to user's shopping list
    const existingItem = await prisma.shoppingListItem.findFirst({
      where: {
        id: itemId,
        shoppingList: {
          userId: req.user.id
        }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Shopping list item not found' });
    }

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit !== undefined) updateData.unit = unit;
    if (purchased !== undefined) updateData.purchased = purchased;
    if (notes !== undefined) updateData.notes = notes;

    const item = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true
          }
        }
      }
    });

    res.json({
      message: 'Shopping list item updated successfully',
      item
    });

  } catch (error) {
    console.error('Update shopping list item error:', error);
    res.status(500).json({ message: 'Failed to update shopping list item' });
  }
});

// POST /api/shopping/lists/:id/items - Add item to shopping list
router.post('/lists/:id/items', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredientId, quantity, unit, notes } = req.body;

    // Check if shopping list exists and belongs to user
    const existingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Check if ingredient exists
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    // Check if item already exists in the list
    const existingItem = await prisma.shoppingListItem.findUnique({
      where: {
        shoppingListId_ingredientId: {
          shoppingListId: id,
          ingredientId
        }
      }
    });

    if (existingItem) {
      // Update existing item quantity
      const updatedItem = await prisma.shoppingListItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          notes: notes || existingItem.notes
        },
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              category: true,
              unit: true
            }
          }
        }
      });

      return res.json({
        message: 'Shopping list item quantity updated',
        item: updatedItem
      });
    }

    // Create new item
    const item = await prisma.shoppingListItem.create({
      data: {
        shoppingListId: id,
        ingredientId,
        quantity,
        unit,
        notes
      },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Item added to shopping list successfully',
      item
    });

  } catch (error) {
    console.error('Add shopping list item error:', error);
    res.status(500).json({ message: 'Failed to add item to shopping list' });
  }
});

// DELETE /api/shopping/items/:itemId - Remove item from shopping list
router.delete('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if item exists and belongs to user's shopping list
    const existingItem = await prisma.shoppingListItem.findFirst({
      where: {
        id: itemId,
        shoppingList: {
          userId: req.user.id
        }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Shopping list item not found' });
    }

    await prisma.shoppingListItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Item removed from shopping list successfully' });

  } catch (error) {
    console.error('Remove shopping list item error:', error);
    res.status(500).json({ message: 'Failed to remove item from shopping list' });
  }
});

module.exports = router; 