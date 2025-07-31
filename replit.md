# Smart Plant Care System

## Overview

This is a full-stack smart plant care system built with React, Express, and PostgreSQL. The application provides automated watering schedules, real-time monitoring of plant conditions, and manual watering controls through a modern web interface with WebSocket communication for live updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket connection for live sensor data and system status

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time**: WebSocket server for bidirectional communication
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with JSON responses

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: ESBuild for Node.js bundling
- **Development**: Hot module replacement with Vite dev server
- **TypeScript**: Strict mode enabled across all packages

## Key Components

### Database Schema
- **Watering Schedules**: Time-based scheduling with frequency and duration settings
- **Watering Logs**: Historical records of watering sessions (manual and scheduled)
- **Sensor Readings**: Environmental data (moisture, temperature, humidity, light)

### Frontend Components
- **Dashboard**: Main interface displaying all system information
- **Moisture Monitor**: Visual gauge showing current soil moisture levels
- **Manual Control**: Toggle switch for immediate watering control
- **Schedule Manager**: CRUD interface for watering schedules
- **Activity Log**: Historical view of watering activities
- **Plant Status**: Environmental sensor readings display

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)
- **WebSocket Server**: Real-time communication for sensor updates and system status
- **Schedule Management**: CRUD operations for watering schedules
- **Logging System**: Activity tracking for all watering events

## Data Flow

1. **Sensor Data**: Environmental sensors → Backend → WebSocket → Frontend display
2. **Manual Watering**: Frontend toggle → WebSocket → Backend → Hardware control
3. **Scheduled Watering**: Cron jobs → Backend execution → WebSocket progress updates
4. **Schedule Management**: Frontend forms → REST API → Database → UI updates

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessible components
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for time formatting and manipulation

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Replit Integration**: Development environment optimizations
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Deployment Strategy

### Production Build
- Frontend assets built to `dist/public` directory
- Backend compiled to `dist/index.js` with ESBuild
- Static file serving integrated into Express server

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development/production mode detection
- Replit-specific optimizations when `REPL_ID` is present

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema defined in `./shared/schema.ts` for type sharing
- Push-based deployment with `db:push` command

The application follows a modular architecture with clear separation between frontend, backend, and shared code. The system is designed to be scalable and maintainable, with TypeScript providing type safety across all layers and a comprehensive component library ensuring consistent UI/UX.

## Recent Changes

### July 31, 2025
- ✓ Fixed TypeScript errors in storage layer and components
- ✓ Added complete ESP32 circuit diagram and Arduino code
- ✓ Implemented auto-stop functionality when moisture reaches 100%
- ✓ Created comprehensive hardware integration documentation
- ✓ Soil moisture sensor connected to GPIO 36 (analog input)
- ✓ DHT22 sensor on GPIO 4, LDR on GPIO 34, pump relay on GPIO 2