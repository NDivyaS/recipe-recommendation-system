const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, ingredientCreateSchema } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/ingredients - Search and list ingredients
router.get('/', async (req, res) => {
  try {
    const { q, category, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    // Text search in ingredient name
    if (q) {
      where.name = { contains: q };
    }

    // Filter by category
    if (category) {
      where.category = { contains: category };
    }

    const ingredients = await prisma.ingredient.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        unit: true,
        caloriesPerUnit: true,
        proteinPerUnit: true,
        carbsPerUnit: true,
        fatPerUnit: true,
        allergens: true
      },
      skip,
      take: parseInt(limit),
      orderBy: [
        { name: 'asc' }
      ]
    });

    const totalCount = await prisma.ingredient.count({ where });

    res.json({
      ingredients,
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
    console.error('Search ingredients error:', error);
    res.status(500).json({ message: 'Failed to search ingredients' });
  }
});

// GET /api/ingredients/:id - Get single ingredient
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        substitutions: {
          include: {
            substitute: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true
              }
            }
          }
        },
        substitutes: {
          include: {
            original: {
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

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    res.json({ ingredient });

  } catch (error) {
    console.error('Get ingredient error:', error);
    res.status(500).json({ message: 'Failed to get ingredient' });
  }
});

// POST /api/ingredients - Create new ingredient (admin functionality)
router.post('/', authenticateToken, validate(ingredientCreateSchema), async (req, res) => {
  try {
    const {
      name,
      category,
      unit,
      caloriesPerUnit,
      proteinPerUnit,
      carbsPerUnit,
      fatPerUnit,
      allergens
    } = req.body;

    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { name }
    });

    if (existingIngredient) {
      return res.status(400).json({ message: 'Ingredient already exists with this name' });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        category,
        unit,
        caloriesPerUnit,
        proteinPerUnit,
        carbsPerUnit,
        fatPerUnit,
        allergens
      }
    });

    res.status(201).json({
      message: 'Ingredient created successfully',
      ingredient
    });

  } catch (error) {
    console.error('Create ingredient error:', error);
    res.status(500).json({ message: 'Failed to create ingredient' });
  }
});

// GET /api/ingredients/:id/substitutes - Get substitutes for an ingredient
router.get('/:id/substitutes', async (req, res) => {
  try {
    const { id } = req.params;
    const { dietaryRestriction } = req.query;

    // Check if ingredient exists
    const ingredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    let where = { originalId: id };

    // Filter by dietary benefit if provided
    if (dietaryRestriction) {
      where.dietaryBenefit = { contains: dietaryRestriction };
    }

    const substitutions = await prisma.ingredientSubstitution.findMany({
      where,
      include: {
        substitute: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true,
            allergens: true,
            caloriesPerUnit: true,
            proteinPerUnit: true,
            carbsPerUnit: true,
            fatPerUnit: true
          }
        }
      },
      orderBy: [
        { ratio: 'asc' }
      ]
    });

    res.json({
      original: ingredient,
      substitutes: substitutions.map(sub => ({
        ...sub.substitute,
        substitutionInfo: {
          ratio: sub.ratio,
          dietaryBenefit: sub.dietaryBenefit,
          flavorProfile: sub.flavorProfile
        }
      }))
    });

  } catch (error) {
    console.error('Get substitutes error:', error);
    res.status(500).json({ message: 'Failed to get substitutes' });
  }
});

// POST /api/ingredients/:originalId/substitutes/:substituteId - Add ingredient substitution
router.post('/:originalId/substitutes/:substituteId', authenticateToken, async (req, res) => {
  try {
    const { originalId, substituteId } = req.params;
    const { ratio = 1.0, dietaryBenefit, flavorProfile } = req.body;

    // Check if both ingredients exist
    const [original, substitute] = await Promise.all([
      prisma.ingredient.findUnique({ where: { id: originalId } }),
      prisma.ingredient.findUnique({ where: { id: substituteId } })
    ]);

    if (!original || !substitute) {
      return res.status(404).json({ message: 'One or both ingredients not found' });
    }

    // Check if substitution already exists
    const existingSubstitution = await prisma.ingredientSubstitution.findUnique({
      where: {
        originalId_substituteId: {
          originalId,
          substituteId
        }
      }
    });

    if (existingSubstitution) {
      return res.status(400).json({ message: 'Substitution already exists' });
    }

    const substitution = await prisma.ingredientSubstitution.create({
      data: {
        originalId,
        substituteId,
        ratio: parseFloat(ratio),
        dietaryBenefit,
        flavorProfile
      },
      include: {
        original: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        substitute: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Ingredient substitution created successfully',
      substitution
    });

  } catch (error) {
    console.error('Create substitution error:', error);
    res.status(500).json({ message: 'Failed to create substitution' });
  }
});

// GET /api/ingredients/categories - Get all ingredient categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.ingredient.findMany({
      select: {
        category: true
      },
      where: {
        category: {
          not: null
        }
      },
      distinct: ['category']
    });

    const categoryList = categories
      .map(item => item.category)
      .filter(Boolean)
      .sort();

    res.json({ categories: categoryList });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to get categories' });
  }
});

// GET /api/ingredients/suggest - Get ingredient suggestions based on user preferences
router.get('/suggest', authenticateToken, async (req, res) => {
  try {
    const { recipeId, dietaryRestrictions } = req.query;

    // Get user's dietary restrictions and allergies
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        dietaryRestrictions: true,
        allergies: true
      }
    });

    let suggestions = [];

    if (recipeId) {
      // Get ingredients from the recipe and suggest alternatives
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          ingredients: {
            include: {
              ingredient: {
                include: {
                  substitutions: {
                    include: {
                      substitute: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (recipe) {
        for (const recipeIngredient of recipe.ingredients) {
          const ingredient = recipeIngredient.ingredient;
          
          // Check if ingredient conflicts with user's restrictions/allergies
          const hasAllergen = user.allergies.some(allergy => 
            ingredient.allergens && ingredient.allergens.includes(allergy.name)
          );

          if (hasAllergen || dietaryRestrictions) {
            // Find suitable substitutes
            const suitableSubstitutes = ingredient.substitutions.filter(sub => {
              const substitute = sub.substitute;
              
              // Check allergens
              const substituteHasAllergen = user.allergies.some(allergy => 
                substitute.allergens && substitute.allergens.includes(allergy.name)
              );

              if (substituteHasAllergen) return false;

              // Check dietary restrictions
              if (dietaryRestrictions) {
                const restrictions = dietaryRestrictions.split(',');
                return restrictions.some(restriction => 
                  sub.dietaryBenefit && sub.dietaryBenefit.toLowerCase().includes(restriction.toLowerCase())
                );
              }

              return true;
            });

            if (suitableSubstitutes.length > 0) {
              suggestions.push({
                original: ingredient,
                quantity: recipeIngredient.quantity,
                unit: recipeIngredient.unit,
                substitutes: suitableSubstitutes.map(sub => ({
                  ...sub.substitute,
                  substitutionRatio: sub.ratio,
                  dietaryBenefit: sub.dietaryBenefit,
                  flavorProfile: sub.flavorProfile
                }))
              });
            }
          }
        }
      }
    }

    res.json({
      suggestions,
      userRestrictions: {
        dietary: user.dietaryRestrictions.map(r => r.name),
        allergies: user.allergies.map(a => a.name)
      }
    });

  } catch (error) {
    console.error('Get ingredient suggestions error:', error);
    res.status(500).json({ message: 'Failed to get ingredient suggestions' });
  }
});

module.exports = router; 