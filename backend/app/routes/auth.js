const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate, userRegistrationSchema, userLoginSchema, userUpdateSchema } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
router.post('/register', validate(userRegistrationSchema), async (req, res) => {
  try {
    const { email, password, name, cookingSkillLevel } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        cookingSkillLevel
      },
      select: {
        id: true,
        email: true,
        name: true,
        cookingSkillLevel: true,
        avatar: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', validate(userLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        dietaryRestrictions: true,
        allergies: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        cookingSkillLevel: true,
        avatar: true,
        bio: true,
        dietaryRestrictions: {
          select: {
            id: true,
            name: true
          }
        },
        allergies: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, validate(userUpdateSchema), async (req, res) => {
  try {
    const { name, cookingSkillLevel, bio, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(cookingSkillLevel && { cookingSkillLevel }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        cookingSkillLevel: true,
        avatar: true,
        bio: true,
        dietaryRestrictions: {
          select: {
            id: true,
            name: true
          }
        },
        allergies: {
          select: {
            id: true,
            name: true
          }
        },
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// POST /api/auth/dietary-restrictions
router.post('/dietary-restrictions', authenticateToken, async (req, res) => {
  try {
    const { restrictions } = req.body; // array of restriction names

    if (!Array.isArray(restrictions)) {
      return res.status(400).json({ message: 'Restrictions must be an array' });
    }

    // Find or create dietary restrictions
    const restrictionObjects = await Promise.all(
      restrictions.map(async (name) => {
        return await prisma.dietaryRestriction.upsert({
          where: { name },
          update: {},
          create: { name }
        });
      })
    );

    // Update user's dietary restrictions
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        dietaryRestrictions: {
          set: restrictionObjects.map(r => ({ id: r.id }))
        }
      }
    });

    res.json({
      message: 'Dietary restrictions updated successfully',
      restrictions: restrictionObjects
    });

  } catch (error) {
    console.error('Update dietary restrictions error:', error);
    res.status(500).json({ message: 'Failed to update dietary restrictions' });
  }
});

// POST /api/auth/allergies
router.post('/allergies', authenticateToken, async (req, res) => {
  try {
    const { allergies } = req.body; // array of allergy names

    if (!Array.isArray(allergies)) {
      return res.status(400).json({ message: 'Allergies must be an array' });
    }

    // Find or create allergies
    const allergyObjects = await Promise.all(
      allergies.map(async (name) => {
        return await prisma.allergy.upsert({
          where: { name },
          update: {},
          create: { name }
        });
      })
    );

    // Update user's allergies
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        allergies: {
          set: allergyObjects.map(a => ({ id: a.id }))
        }
      }
    });

    res.json({
      message: 'Allergies updated successfully',
      allergies: allergyObjects
    });

  } catch (error) {
    console.error('Update allergies error:', error);
    res.status(500).json({ message: 'Failed to update allergies' });
  }
});

module.exports = router; 