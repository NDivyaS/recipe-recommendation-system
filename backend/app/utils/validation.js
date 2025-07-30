const Joi = require('joi');

// User validation schemas
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required(),
  cookingSkillLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner')
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  cookingSkillLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  bio: Joi.string().max(500).allow(''),
  avatar: Joi.string().uri().allow('')
});

// Recipe validation schemas
const recipeCreateSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).allow(''),
  instructions: Joi.string().required(),
  prepTime: Joi.number().min(0).required(),
  cookTime: Joi.number().min(0).required(),
  servings: Joi.number().min(1).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('easy'),
  cuisine: Joi.string().max(50).allow(''),
  imageUrl: Joi.string().uri().allow(''),
  calories: Joi.number().min(0),
  protein: Joi.number().min(0),
  carbs: Joi.number().min(0),
  fat: Joi.number().min(0),
  fiber: Joi.number().min(0),
  ingredients: Joi.array().items(
    Joi.object({
      ingredientId: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().required(),
      notes: Joi.string().allow('')
    })
  ).min(1).required(),
  tags: Joi.array().items(Joi.string())
});

const recipeUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().max(500).allow(''),
  instructions: Joi.string(),
  prepTime: Joi.number().min(0),
  cookTime: Joi.number().min(0),
  servings: Joi.number().min(1),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  cuisine: Joi.string().max(50).allow(''),
  imageUrl: Joi.string().uri().allow(''),
  calories: Joi.number().min(0),
  protein: Joi.number().min(0),
  carbs: Joi.number().min(0),
  fat: Joi.number().min(0),
  fiber: Joi.number().min(0),
  ingredients: Joi.array().items(
    Joi.object({
      ingredientId: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().required(),
      notes: Joi.string().allow('')
    })
  ),
  tags: Joi.array().items(Joi.string())
});

// Ingredient validation schemas
const ingredientCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().max(50).allow(''),
  unit: Joi.string().default('piece'),
  caloriesPerUnit: Joi.number().min(0),
  proteinPerUnit: Joi.number().min(0),
  carbsPerUnit: Joi.number().min(0),
  fatPerUnit: Joi.number().min(0),
  allergens: Joi.string().allow('')
});

// Shopping list validation schemas
const shoppingListCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  items: Joi.array().items(
    Joi.object({
      ingredientId: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().required(),
      notes: Joi.string().allow('')
    })
  )
});

// Query parameter validation
const recipeSearchSchema = Joi.object({
  q: Joi.string().allow(''), // search query
  cuisine: Joi.string().allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').allow(''),
  maxPrepTime: Joi.number().min(0),
  maxCookTime: Joi.number().min(0),
  minServings: Joi.number().min(1),
  maxServings: Joi.number().min(1),
  tags: Joi.string().allow(''), // comma-separated
  dietaryRestrictions: Joi.string().allow(''), // comma-separated
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(20)
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        message: 'Query validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
  recipeCreateSchema,
  recipeUpdateSchema,
  ingredientCreateSchema,
  shoppingListCreateSchema,
  recipeSearchSchema
}; 