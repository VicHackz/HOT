# Home of Textile - Supplier Portal

A textile company supplier portal built for the thesis project researching user acceptance in automated information environments.

## 🎯 Project Overview

This portal allows suppliers to upload product information and images, while administrators can review, filter, edit, and manage all submissions across multiple suppliers.

### Built With

- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **LocalStorage** for data persistence
- **Home of Textile** branding (Spartan font, Jakobsdals deep green color)

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Server is running at: http://localhost:5173**

## 🎨 Design Principles

The portal implements 4 key actionability principles from the thesis research:

1. **Clear Action Repertoire** (Tydlig handlingsrepertoar)
   - Obvious primary actions throughout the interface
   - Consistent button placement across all views

2. **Clear Feedback** (Tydlig feedback)
   - Toast notifications for all user actions
   - Immediate image preview on file select
   - Inline validation messages

3. **Easy Navigation** (Lättnavigerbart)
   - Simple 2-tab structure for suppliers
   - Clear breadcrumb navigation for admin
   - Persistent logout button

4. **Known & Understandable Vocabulary** (Känd och begriplig vokabulär)
   - Textile industry terminology
   - Clear status names (Pending Review, Approved, Archived)
   - Descriptive labels and helper text

## 👥 User Roles

### Suppliers (5 pre-configured)
- **Nordic Textiles AB** (Sweden)
- **Bangalore Fabrics Ltd** (India)
- **Milano Design House** (Italy)
- **Copenhagen Interiors** (Denmark)
- **Istanbul Textile Co** (Turkey)

### Admin
- Single admin user with full access to all products

## 📋 Features

### Supplier Features
- **Upload Products**: Complete form with image upload, validation, and instant preview
- **Upload History**: View all previously uploaded products with status tracking
- **Read-Only Details**: Click any product to see full details

### Admin Features
- **Filter & Search**: Filter by supplier, category, status, or search by product name
- **Product Management**: View all products from all suppliers in a unified grid
- **Edit Products**: Full edit capabilities for all product fields
- **Status Management**: Change status (Pending Review → Approved → Archived)
- **Archive Products**: Archive products with confirmation

## 🗂️ Project Structure

```
/supplier-portal
  /src
    /components
      /common          # Reusable UI components
      /supplier        # Supplier-specific components
      /admin           # Admin-specific components
    /pages             # Main views
    /context           # React Context for state management
    /types             # TypeScript interfaces
    /utils             # Helper functions
    /styles            # Global CSS
    /data              # Mock data (20 seed products)
  /public              # Static assets (logo, font)
```

## 💾 Data

- **Storage**: LocalStorage (key: 'hot-portal-data')
- **Seed Data**: 20 realistic textile products across 5 suppliers
- **Categories**: Sofa, Chair, Table, Fabric, Other
- **Statuses**: Pending Review, Approved, Archived

## 🎓 Thesis Integration

This portal serves as the **artifact** for evaluating:
- Technology Acceptance Model (TAM) metrics
- User acceptance in automated environments
- Actionability principles in practice
- Transparency to avoid "black box" effects

Perfect for user testing and TAM questionnaire evaluation!

## 🔗 Navigation Flow

```
Login → Select Role/Supplier
  ├─ Admin → Product Grid → Product Detail (Edit)
  └─ Supplier → Upload Product / Upload History
       └─ Both can Logout (returns to Login)
```

## 🎨 Brand Assets

- **Logo**: Home of Textile (hot.png)
- **Primary Color**: #51504C (Jakobsdals deep green)
- **Font**: Spartan (variable weight)
- **Status Colors**:
  - Yellow (#f59e0b) = Pending Review
  - Green (#10b981) = Approved
  - Gray (#6b7280) = Archived

## 📱 Responsive Design

Desktop-first design, optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🚫 What's NOT Included

- No real authentication or security
- No backend or database
- No password protection
- No file upload to server (images stored as data URLs)

This is intentional - the focus is on UI/UX and user acceptance evaluation!

---

**Built with ❤️ for the Home of Textile thesis project**
