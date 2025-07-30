const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create dietary restrictions
  const dietaryRestrictions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'keto',
    'paleo',
    'low-carb',
    'low-sodium',
    'sugar-free'
  ];

  console.log('Creating dietary restrictions...');
  for (const restriction of dietaryRestrictions) {
    await prisma.dietaryRestriction.upsert({
      where: { name: restriction },
      update: {},
      create: { name: restriction }
    });
  }

  // Create allergies
  const allergies = [
    'nuts',
    'dairy',
    'eggs',
    'shellfish',
    'fish',
    'soy',
    'wheat',
    'gluten',
    'sesame',
    'sulfites'
  ];

  console.log('Creating allergies...');
  for (const allergy of allergies) {
    await prisma.allergy.upsert({
      where: { name: allergy },
      update: {},
      create: { name: allergy }
    });
  }

  // Create ingredients
  const ingredients = [
    // Proteins
    { name: 'Chicken Breast', category: 'proteins', unit: 'lb', caloriesPerUnit: 750, proteinPerUnit: 140, allergens: null },
    { name: 'Ground Beef', category: 'proteins', unit: 'lb', caloriesPerUnit: 1200, proteinPerUnit: 100, allergens: null },
    { name: 'Salmon Fillet', category: 'proteins', unit: 'lb', caloriesPerUnit: 900, proteinPerUnit: 120, allergens: 'fish' },
    { name: 'Tofu', category: 'proteins', unit: 'block', caloriesPerUnit: 180, proteinPerUnit: 20, allergens: 'soy' },
    { name: 'Eggs', category: 'proteins', unit: 'dozen', caloriesPerUnit: 840, proteinPerUnit: 72, allergens: 'eggs' },
    { name: 'Black Beans', category: 'proteins', unit: 'can', caloriesPerUnit: 300, proteinPerUnit: 15, allergens: null },

    // Vegetables
    { name: 'Broccoli', category: 'vegetables', unit: 'head', caloriesPerUnit: 25, proteinPerUnit: 3, allergens: null },
    { name: 'Spinach', category: 'vegetables', unit: 'bunch', caloriesPerUnit: 20, proteinPerUnit: 3, allergens: null },
    { name: 'Bell Peppers', category: 'vegetables', unit: 'piece', caloriesPerUnit: 25, proteinPerUnit: 1, allergens: null },
    { name: 'Onions', category: 'vegetables', unit: 'piece', caloriesPerUnit: 40, proteinPerUnit: 1, allergens: null },
    { name: 'Tomatoes', category: 'vegetables', unit: 'piece', caloriesPerUnit: 20, proteinPerUnit: 1, allergens: null },
    { name: 'Carrots', category: 'vegetables', unit: 'piece', caloriesPerUnit: 25, proteinPerUnit: 1, allergens: null },

    // Grains
    { name: 'Brown Rice', category: 'grains', unit: 'cup', caloriesPerUnit: 220, proteinPerUnit: 5, allergens: null },
    { name: 'Quinoa', category: 'grains', unit: 'cup', caloriesPerUnit: 220, proteinPerUnit: 8, allergens: null },
    { name: 'Whole Wheat Pasta', category: 'grains', unit: 'cup', caloriesPerUnit: 180, proteinPerUnit: 8, allergens: 'wheat, gluten' },
    { name: 'Gluten-Free Pasta', category: 'grains', unit: 'cup', caloriesPerUnit: 200, proteinPerUnit: 4, allergens: null },

    // Dairy
    { name: 'Milk', category: 'dairy', unit: 'cup', caloriesPerUnit: 150, proteinPerUnit: 8, allergens: 'dairy' },
    { name: 'Cheddar Cheese', category: 'dairy', unit: 'cup', caloriesPerUnit: 450, proteinPerUnit: 28, allergens: 'dairy' },
    { name: 'Greek Yogurt', category: 'dairy', unit: 'cup', caloriesPerUnit: 130, proteinPerUnit: 20, allergens: 'dairy' },
    { name: 'Almond Milk', category: 'dairy-alternatives', unit: 'cup', caloriesPerUnit: 40, proteinPerUnit: 1, allergens: 'nuts' },

    // Spices and seasonings
    { name: 'Salt', category: 'spices', unit: 'tsp', caloriesPerUnit: 0, proteinPerUnit: 0, allergens: null },
    { name: 'Black Pepper', category: 'spices', unit: 'tsp', caloriesPerUnit: 6, proteinPerUnit: 0, allergens: null },
    { name: 'Garlic Powder', category: 'spices', unit: 'tsp', caloriesPerUnit: 10, proteinPerUnit: 0, allergens: null },
    { name: 'Olive Oil', category: 'oils', unit: 'tbsp', caloriesPerUnit: 120, proteinPerUnit: 0, allergens: null },
    { name: 'Coconut Oil', category: 'oils', unit: 'tbsp', caloriesPerUnit: 120, proteinPerUnit: 0, allergens: null },

    // Nuts and seeds
    { name: 'Almonds', category: 'nuts', unit: 'cup', caloriesPerUnit: 550, proteinPerUnit: 20, allergens: 'nuts' },
    { name: 'Walnuts', category: 'nuts', unit: 'cup', caloriesPerUnit: 650, proteinPerUnit: 15, allergens: 'nuts' },
    { name: 'Sunflower Seeds', category: 'seeds', unit: 'cup', caloriesPerUnit: 270, proteinPerUnit: 10, allergens: null }
  ];

  console.log('Creating ingredients...');
  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      update: {},
      create: ingredient
    });
  }

  // Create recipe tags
  const tags = [
    'quick', 'easy', 'healthy', 'comfort-food', 'one-pot', 'meal-prep', 
    'high-protein', 'low-carb', 'family-friendly', 'dinner', 'lunch', 'breakfast'
  ];

  console.log('Creating recipe tags...');
  for (const tag of tags) {
    await prisma.recipeTag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag }
    });
  }

  // Get created ingredients for recipe creation
  const chickenBreast = await prisma.ingredient.findUnique({ where: { name: 'Chicken Breast' } });
  const broccoli = await prisma.ingredient.findUnique({ where: { name: 'Broccoli' } });
  const brownRice = await prisma.ingredient.findUnique({ where: { name: 'Brown Rice' } });
  const oliveOil = await prisma.ingredient.findUnique({ where: { name: 'Olive Oil' } });
  const salt = await prisma.ingredient.findUnique({ where: { name: 'Salt' } });
  const blackPepper = await prisma.ingredient.findUnique({ where: { name: 'Black Pepper' } });

  // Create sample recipes
  console.log('Creating sample recipes...');
  
  const healthyChickenBowl = await prisma.recipe.create({
    data: {
      title: 'Healthy Chicken and Broccoli Bowl',
      description: 'A nutritious and delicious meal prep-friendly bowl with lean protein and vegetables.',
      instructions: `1. Cook brown rice according to package instructions.
2. Season chicken breast with salt and pepper.
3. Heat olive oil in a large skillet over medium-high heat.
4. Cook chicken breast for 6-7 minutes per side until cooked through.
5. Steam broccoli for 4-5 minutes until tender-crisp.
6. Slice chicken and serve over rice with broccoli.
7. Drizzle with remaining olive oil and season to taste.`,
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'american',
      calories: 450,
      protein: 40,
      carbs: 35,
      fat: 15,
      fiber: 5,
      ingredients: {
        create: [
          { ingredientId: chickenBreast.id, quantity: 1, unit: 'lb', notes: 'boneless, skinless' },
          { ingredientId: broccoli.id, quantity: 2, unit: 'head', notes: 'cut into florets' },
          { ingredientId: brownRice.id, quantity: 2, unit: 'cup', notes: 'uncooked' },
          { ingredientId: oliveOil.id, quantity: 2, unit: 'tbsp', notes: null },
          { ingredientId: salt.id, quantity: 1, unit: 'tsp', notes: 'to taste' },
          { ingredientId: blackPepper.id, quantity: 0.5, unit: 'tsp', notes: 'to taste' }
        ]
      },
      tags: {
        connect: [
          { name: 'healthy' },
          { name: 'meal-prep' },
          { name: 'high-protein' },
          { name: 'dinner' }
        ]
      }
    }
  });

  // Create ingredient substitutions
  console.log('Creating ingredient substitutions...');
  
  const tofu = await prisma.ingredient.findUnique({ where: { name: 'Tofu' } });
  const groundBeef = await prisma.ingredient.findUnique({ where: { name: 'Ground Beef' } });
  const blackBeans = await prisma.ingredient.findUnique({ where: { name: 'Black Beans' } });
  const glutenFreePasta = await prisma.ingredient.findUnique({ where: { name: 'Gluten-Free Pasta' } });
  const wholeWheatPasta = await prisma.ingredient.findUnique({ where: { name: 'Whole Wheat Pasta' } });
  const almondMilk = await prisma.ingredient.findUnique({ where: { name: 'Almond Milk' } });
  const milk = await prisma.ingredient.findUnique({ where: { name: 'Milk' } });

  const substitutions = [
    // Protein substitutions
    { originalId: chickenBreast.id, substituteId: tofu.id, ratio: 1.0, dietaryBenefit: 'vegan', flavorProfile: 'milder' },
    { originalId: groundBeef.id, substituteId: blackBeans.id, ratio: 0.8, dietaryBenefit: 'vegetarian', flavorProfile: 'different' },
    
    // Gluten-free substitutions
    { originalId: wholeWheatPasta.id, substituteId: glutenFreePasta.id, ratio: 1.0, dietaryBenefit: 'gluten-free', flavorProfile: 'similar' },
    
    // Dairy-free substitutions
    { originalId: milk.id, substituteId: almondMilk.id, ratio: 1.0, dietaryBenefit: 'dairy-free', flavorProfile: 'slightly nutty' }
  ];

  for (const sub of substitutions) {
    await prisma.ingredientSubstitution.upsert({
      where: {
        originalId_substituteId: {
          originalId: sub.originalId,
          substituteId: sub.substituteId
        }
      },
      update: {},
      create: sub
    });
  }

  // Create a test user
  console.log('Creating test user...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      cookingSkillLevel: 'intermediate',
      bio: 'Love cooking healthy meals!',
      dietaryRestrictions: {
        connect: [
          { name: 'vegetarian' }
        ]
      },
      allergies: {
        connect: [
          { name: 'nuts' }
        ]
      }
    }
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 