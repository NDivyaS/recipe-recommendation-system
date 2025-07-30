const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, validateQuery, recipeCreateSchema, recipeUpdateSchema, recipeSearchSchema } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/recipes - Search and list recipes
router.get('/', validateQuery(recipeSearchSchema), optionalAuth, async (req, res) => {
  try {
    const {
      q,
      cuisine,
      difficulty,
      maxPrepTime,
      maxCookTime,
      minServings,
      maxServings,
      tags,
      dietaryRestrictions,
      page,
      limit
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Text search in title and description
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } }
      ];
    }

    // Filter by cuisine
    if (cuisine) {
      where.cuisine = { contains: cuisine };
    }

    // Filter by difficulty
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Filter by prep time
    if (maxPrepTime) {
      where.prepTime = { lte: parseInt(maxPrepTime) };
    }

    // Filter by cook time
    if (maxCookTime) {
      where.cookTime = { lte: parseInt(maxCookTime) };
    }

    // Filter by servings
    if (minServings || maxServings) {
      where.servings = {};
      if (minServings) where.servings.gte = parseInt(minServings);
      if (maxServings) where.servings.lte = parseInt(maxServings);
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = {
        some: {
          name: { in: tagArray }
        }
      };
    }

    // Filter by dietary restrictions
    if (dietaryRestrictions && req.user) {
      const restrictionArray = dietaryRestrictions.split(',').map(r => r.trim());
      // This is a complex filter that would need custom logic
      // For now, we'll implement a basic version
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        ingredients: {
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
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        },
        favoritedBy: req.user ? {
          where: { id: req.user.id },
          select: { id: true }
        } : false
      },
      skip,
      take: limit,
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Get total count for pagination
    const totalCount = await prisma.recipe.count({ where });

    // Transform recipes to include isFavorited flag
    const recipesWithFavorites = recipes.map(recipe => ({
      ...recipe,
      isFavorited: req.user ? recipe.favoritedBy.length > 0 : false,
      favoritedBy: undefined // Remove the favoritedBy array from response
    }));

    res.json({
      recipes: recipesWithFavorites,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({ message: 'Failed to search recipes' });
  }
});

// GET /api/recipes/:id - Get single recipe
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true,
                allergens: true
              }
            }
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        },
        favoritedBy: req.user ? {
          where: { id: req.user.id },
          select: { id: true }
        } : false
      }
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Transform recipe to include isFavorited flag
    const recipeWithFavorite = {
      ...recipe,
      isFavorited: req.user ? recipe.favoritedBy.length > 0 : false,
      favoritedBy: undefined
    };

    res.json({ recipe: recipeWithFavorite });

  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ message: 'Failed to get recipe' });
  }
});

// POST /api/recipes - Create new recipe
router.post('/', authenticateToken, validate(recipeCreateSchema), async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      cuisine,
      imageUrl,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      ingredients,
      tags
    } = req.body;

    // Create recipe with ingredients and tags
    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        instructions,
        prepTime,
        cookTime,
        servings,
        difficulty,
        cuisine,
        imageUrl,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        ingredients: {
          create: ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes
          }))
        },
        tags: tags ? {
          connectOrCreate: tags.map(tagName => ({
            where: { name: tagName },
            create: { name: tagName }
          }))
        } : undefined
      },
      include: {
        ingredients: {
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
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe
    });

  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: 'Failed to create recipe' });
  }
});

// PUT /api/recipes/:id - Update recipe
router.put('/:id', authenticateToken, validate(recipeUpdateSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      cuisine,
      imageUrl,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      ingredients,
      tags
    } = req.body;

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Update recipe
    const updateData = {};
    
    // Update basic fields
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (cookTime !== undefined) updateData.cookTime = cookTime;
    if (servings !== undefined) updateData.servings = servings;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (cuisine !== undefined) updateData.cuisine = cuisine;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (calories !== undefined) updateData.calories = calories;
    if (protein !== undefined) updateData.protein = protein;
    if (carbs !== undefined) updateData.carbs = carbs;
    if (fat !== undefined) updateData.fat = fat;
    if (fiber !== undefined) updateData.fiber = fiber;

    // Handle ingredients update
    if (ingredients) {
      updateData.ingredients = {
        deleteMany: {},
        create: ingredients.map(ing => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        }))
      };
    }

    // Handle tags update
    if (tags) {
      updateData.tags = {
        set: [],
        connectOrCreate: tags.map(tagName => ({
          where: { name: tagName },
          create: { name: tagName }
        }))
      };
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: updateData,
      include: {
        ingredients: {
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
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Recipe updated successfully',
      recipe
    });

  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ message: 'Failed to update recipe' });
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    await prisma.recipe.delete({
      where: { id }
    });

    res.json({ message: 'Recipe deleted successfully' });

  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
});

// POST /api/recipes/:id/favorite - Toggle favorite recipe
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        favoritedBy: {
          where: { id: userId }
        }
      }
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const isFavorited = recipe.favoritedBy.length > 0;

    if (isFavorited) {
      // Remove from favorites
      await prisma.recipe.update({
        where: { id },
        data: {
          favoritedBy: {
            disconnect: { id: userId }
          }
        }
      });
    } else {
      // Add to favorites
      await prisma.recipe.update({
        where: { id },
        data: {
          favoritedBy: {
            connect: { id: userId }
          }
        }
      });
    }

    res.json({
      message: isFavorited ? 'Recipe removed from favorites' : 'Recipe added to favorites',
      isFavorited: !isFavorited
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
});

// GET /api/recipes/favorites/my - Get user's favorite recipes
router.get('/favorites/my', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const recipes = await prisma.recipe.findMany({
      where: {
        favoritedBy: {
          some: {
            id: req.user.id
          }
        }
      },
      include: {
        ingredients: {
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
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    const totalCount = await prisma.recipe.count({
      where: {
        favoritedBy: {
          some: {
            id: req.user.id
          }
        }
      }
    });

    res.json({
      recipes: recipes.map(recipe => ({ ...recipe, isFavorited: true })),
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
    console.error('Get favorite recipes error:', error);
    res.status(500).json({ message: 'Failed to get favorite recipes' });
  }
});

module.exports = router; 