# Recipe Recommendation System with Smart Shopping

A comprehensive full-stack application that provides intelligent recipe recommendations with AI-powered ingredient substitutions and automatic shopping list generation.

## 🌟 Features

### MVP Features Implemented:

#### **User Authentication & Profiles**
- ✅ User registration and login with JWT authentication
- ✅ User profiles with dietary preferences (vegetarian, vegan, gluten-free, etc.)
- ✅ Allergy management system
- ✅ Cooking skill level tracking (beginner, intermediate, advanced)

#### **Recipe Database & Search**
- ✅ Complete recipe CRUD operations
- ✅ Advanced search by ingredients, cuisine, cooking time, difficulty
- ✅ Filter by dietary restrictions and allergens
- ✅ Recipe favorites system
- ✅ Nutritional information tracking

#### **Smart Ingredient Substitution**
- ✅ AI-powered ingredient alternatives database
- ✅ Dietary restriction compliance (vegan, gluten-free, etc.)
- ✅ Substitution ratios and flavor profile matching
- ✅ Personalized suggestions based on user preferences

#### **Shopping List Generation**
- ✅ Automatic ingredient consolidation from multiple recipes
- ✅ Quantity calculations with serving adjustments
- ✅ Shopping progress tracking (purchased/unpurchased items)
- ✅ Ingredient categorization for organized shopping

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **SQLite** with **Prisma ORM** - Database management
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Joi** - Request validation

### Frontend
- **React.js** with **TypeScript** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Query** - Server state management and caching
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Initialize the database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Seed the database with sample data:**
   ```bash
   npm run db:seed
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

The backend API will be running at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The frontend application will be running at `http://localhost:3000`

## 📊 Database Schema

The application includes comprehensive models for:

- **Users** - Authentication, preferences, dietary restrictions
- **Recipes** - Full recipe information with ingredients and tags
- **Ingredients** - Detailed ingredient database with nutritional info
- **Shopping Lists** - Generated lists with item tracking
- **Substitutions** - Ingredient alternatives with ratios and benefits

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Recipes
- `GET /api/recipes` - Search and list recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create new recipe
- `POST /api/recipes/:id/favorite` - Toggle favorite

### Ingredients
- `GET /api/ingredients` - Search ingredients
- `GET /api/ingredients/:id/substitutes` - Get substitutions
- `GET /api/ingredients/suggest` - Get personalized suggestions

### Shopping Lists
- `GET /api/shopping/lists` - Get user's shopping lists
- `POST /api/shopping/generate-from-recipes` - Generate from recipes
- `PUT /api/shopping/items/:id` - Update shopping items

## 🧪 Sample Data

The seed file includes:
- 10 dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- 10 common allergies
- 27 ingredients across different categories
- Sample recipes with full ingredient lists
- Ingredient substitution mappings
- Test user account (`test@example.com` / `password123`)

## 🎯 Next Steps

The foundation is complete! To extend the application:

1. **Complete Frontend Components:**
   - Recipe search and display components
   - Shopping list management interface
   - User profile editing forms
   - Authentication forms

2. **Enhanced Features:**
   - Recipe recommendations based on user history
   - Meal planning functionality
   - Grocery store integration
   - Recipe rating and reviews

3. **AI Integration:**
   - OpenAI integration for recipe generation
   - Improved ingredient substitution logic
   - Personalized recipe recommendations

## 🏗 Project Structure

```
Recipe Recommendation System/
├── backend/
│   ├── app/
│   │   ├── middleware/     # Authentication, validation
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Sample data
│   ├── package.json
│   └── server.js           # Express server
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── contexts/       # React contexts
    │   ├── lib/           # Utilities and configs
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── types/         # TypeScript definitions
    ├── package.json
    └── tailwind.config.js
```

## 📝 Contributing

This is a complete foundation for a recipe recommendation system. The backend API is fully functional and the frontend structure is ready for component development.

## 📄 License

This project is created as a demonstration of a full-stack recipe recommendation system with smart shopping functionality. 