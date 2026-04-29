# AI Rules for Mitra Finance Dashboard

## Tech Stack

- **React 18.3.1** - Frontend framework with TypeScript support
- **Vite** - Build tool and development server for fast hot reload
- **TypeScript** - Static type checking for better code quality
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - High-quality component library built on Radix UI
- **Supabase** - Backend-as-a-Service with real-time capabilities
- **React Router DOM** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Recharts** - Data visualization library for charts
- **Zod** - Schema validation for forms
- **React Hook Form** - Form management with validation
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## Library Usage Rules

### UI Components
- **Always use shadcn/ui components** when available
- **Never create custom UI components** if shadcn/ui has an equivalent
- **Import shadcn/ui components** from `@/components/ui/[component]`
- **Use Tailwind CSS classes** for custom styling within shadcn/ui components
- **Never use inline styles** - always use Tailwind CSS classes

### Forms
- **Always use React Hook Form** for form management
- **Always use Zod** for form validation schemas
- **Combine React Hook Form with Zod** using `zodResolver`
- **Use shadcn/ui form components** (Form, FormField, FormItem, FormLabel, FormMessage)
- **Never use controlled inputs** without React Hook Form

### Data Fetching & State Management
- **Always use TanStack Query** for server state management
- **Use React Query hooks** (`useQuery`, `useMutation`) for API calls
- **Never use `useState` for server data** - use TanStack Query instead
- **Use Supabase client** for all database operations
- **Always handle loading and error states** in components

### Routing
- **Always use React Router DOM** for navigation
- **Define routes in `src/App.tsx`** using `<Routes>` and `<Route>`
- **Use `useNavigate`** for programmatic navigation
- **Create protected routes** using the `ProtectedRoute` component
- **Never use direct browser navigation** - use React Router methods

### Styling
- **Always use Tailwind CSS** for all styling
- **Never write custom CSS** - use Tailwind classes instead
- **Use the design system colors** defined in `tailwind.config.ts`
- **Follow the existing color scheme** (green pistache for light, navy blue for dark)
- **Use responsive design** with Tailwind's responsive utilities

### Icons
- **Always use Lucide React icons** - never use other icon libraries
- **Import icons** directly from `lucide-react`
- **Use consistent icon sizes** (typically h-4 w-4 or h-5 w-5)
- **Never use SVG icons** directly - use Lucide React components

### Data Validation
- **Always use Zod** for runtime validation
- **Create validation schemas** for all forms and API responses
- **Use Zod's error messages** for user feedback
- **Never use manual validation** - always use Zod schemas

### Database Operations
- **Always use Supabase client** for database operations
- **Use TypeScript types** from `@/integrations/supabase/types`
- **Handle errors gracefully** with try-catch blocks
- **Use real-time subscriptions** for live data updates
- **Never use raw SQL** - use Supabase's query builder

### Charts & Visualization
- **Always use Recharts** for data visualization
- **Create responsive charts** with `ResponsiveContainer`
- **Use consistent colors** from the design system
- **Never use other chart libraries** - only Recharts is allowed

### Authentication
- **Always use Supabase Auth** for authentication
- **Use the `useAuth` hook** from `@/contexts/AuthContext`
- **Never implement custom auth** - use Supabase's built-in auth
- **Handle loading states** during auth operations

### File Structure
- **Keep components in `src/components/`**
- **Keep pages in `src/pages/`**
- **Keep hooks in `src/hooks/`**
- **Keep contexts in `src/contexts/`**
- **Keep utilities in `src/lib/`**
- **Keep integrations in `src/integrations/`**

### Code Quality
- **Always use TypeScript** - no JavaScript files allowed
- **Follow ESLint rules** - never disable linting
- **Use meaningful variable names** - avoid abbreviations
- **Write clean, readable code** - avoid complex logic
- **Add proper error handling** for all async operations

### Performance
- **Use React.memo** for expensive components
- **Use useCallback** for functions passed to child components
- **Use useMemo** for expensive calculations
- **Never do heavy computations** in render functions
- **Optimize chart rendering** with proper data transformation

### Testing
- **Always write tests** for new features
- **Use React Testing Library** for component tests
- **Test user interactions** - not implementation details
- **Mock API calls** in tests
- **Never test third-party libraries** - test your code only