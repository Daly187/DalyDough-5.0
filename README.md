# DalyDough - Advanced Forex Trading Assistant

This document provides a comprehensive overview of the DalyDough application, its architecture, data flow, and key features. It is intended to serve as a detailed "save document" for understanding and recreating the project.

## 1. Project Overview

DalyDough is a sophisticated web application designed to empower forex traders by providing advanced tools for market analysis, automated trading, and risk management. Its core feature is the proprietary **D-Score System**, a quantitative algorithm that scans the forex market to identify high-probability trade setups. The platform integrates real-time market data, technical indicators, and a user-friendly interface to help traders make smarter, data-driven decisions.

## 2. Technology Stack

The application is built on a modern, robust, and scalable technology stack.

- **Framework:** **Next.js 15** (using the App Router). This provides server-side rendering (SSR), Server Components for performance, and a file-based routing system.
- **Language:** **TypeScript**. This ensures type safety and improves code quality and maintainability.
- **UI Components:** **ShadCN UI**. A collection of beautifully designed, accessible, and composable components built on top of Radix UI and Tailwind CSS. The base components are located in `src/components/ui`.
- **Styling:** **Tailwind CSS**. A utility-first CSS framework for rapid and consistent UI development. The theme and global styles are defined in `src/app/globals.css`.
- **Data Fetching:** Native `fetch` API, encapsulated within dedicated API service modules.
- **AI Integration:** **Google Genkit**. The framework is configured in `src/ai/genkit.ts` for potential future AI features, though it is not currently used for core functionality.
- **Technical Indicators:** **`technicalindicators` library**. Used for performing the mathematical calculations for indicators like EMA, RSI, ADX, etc.

## 3. Architecture & Data Flow

The application's architecture is designed to be modular and scalable, with a clear separation of concerns between data fetching, data processing, and UI presentation.

### 3.1. Data Fetching Layer

- **Source:** All market data is sourced from the **Financial Modeling Prep (FMP) API**.
- **API Module (`src/lib/api/fmp-api.ts`):** This is the single point of contact with the external FMP API.
    - It contains a `fetchWithCache` function that provides simple in-memory caching to avoid redundant API calls.
    - It exports two specific functions:
        - `fetchQuote(symbol)`: Fetches the live spot price and daily change for a currency pair.
        - `fetchHistorical(symbol, limit)`: Fetches historical price data (Open, High, Low, Close) for a specified period.
    - It handles potential API response variations (e.g., a single object vs. an array, or data nested in a `historical` property).
- **Environment Variables:** The FMP API key is managed via `process.env.FMP_API_KEY`, with a fallback public key in `fmp-api.ts` for out-of-the-box functionality.

### 3.2. Data Processing & Scoring Layer (`src/lib/fmp.ts`)

This layer is responsible for taking the raw data from the API layer and transforming it into the meaningful D-Score.

1.  **`getForexData(pair)`:** This is the primary function for a single currency pair.
    - It calls `fetchQuote` and `fetchHistorical` in parallel to get both live and historical data.
    - It prepares the data for different timeframes (Daily, 4-Hour, Weekly) to analyze trends.
2.  **Indicator Calculation (`src/lib/indicators/`):**
    - The `calculateIndicators` function in `src/lib/indicators/index.ts` orchestrates the calculation of all required technical indicators.
    - Each indicator calculation is broken into its own file (`ema.ts`, `adx.ts`, `rsi.ts`, etc.) for modularity and clarity.
3.  **Smart Scoring (`calculateSmartDScore` in `fmp.ts`):**
    - This function takes the calculated indicators and applies a weighted scoring algorithm to generate the final D-Score (0-10).
    - **Key Components of the D-Score:**
        - **Trend Alignment (Weight: 3.0):** The most critical factor. It checks if the trend across multiple timeframes (4H, 1D, 1W) is aligned (all up or all down).
        - **Trend Strength (ADX, Weight: 1.5):** Measures the strength of the current trend.
        - **Momentum (RSI & MACD, Weight: 1.0 each):** Measures the velocity of price changes.
        - **Volatility (ATR, Weight: 1.0):** Assesses market volatility to find optimal conditions.
        - **Other Confirmations (Weight: 0.5 each):** Bollinger Bands, Stochastic Oscillator, CCI, etc., provide additional context.
4.  **Final Output:** The process culminates in a comprehensive `DScore` object, which includes the final score, a letter grade (A, B, C), a trade signal (Buy, Sell, Block), and all the underlying raw and weighted values.

## 4. File & Directory Structure

- `src/app/(app)`: Contains all the main application pages that share the primary layout.
    - `layout.tsx`: Defines the root layout for the authenticated app, including the `Sidebar` and `Header`.
    - `dashboard/page.tsx`: The main dashboard page.
    - `d-score-detailed/page.tsx`: A detailed table showing the weighted D-Score components for each pair.
    - `market-detailed/page.tsx`: A detailed table showing the raw technical indicator values for each pair.
    - `bots/page.tsx`: Page for managing active and closed trading bots.
    - `autobot/page.tsx`: The interface for configuring and launching new trading bots.
    - `strength/page.tsx`: The Currency Strength Index page.
    - `... (other pages)`
- `src/app/page.tsx`: The public-facing landing page.
- `src/components`: Contains all reusable React components.
    - `ui/`: Core ShadCN UI components (Button, Card, Table, etc.).
    - `dashboard/`: Components specific to the Dashboard page.
    - `bots/`: Components for the Bots Management page.
    - `autobot/`: Components for the Auto Bot Launcher page.
    - `... (other feature-specific component folders)`
- `src/lib`: Houses the core business logic, data definitions, and utilities.
    - `api/fmp-api.ts`: Handles all communication with the external FMP API.
    - `indicators/`: Contains individual files for each technical indicator calculation.
    - `fmp.ts`: The central data processing and D-Score calculation logic.
    - `data.ts`: Contains static data, like the list of currency pairs and mock data for development.
    - `types.ts`: Defines all TypeScript types and interfaces used across the application (`DScore`, `Bot`, etc.).
    - `utils.ts`: Utility functions, primarily `cn` for merging Tailwind CSS classes.
- `src/hooks`: Custom React hooks, such as `use-toast` and `use-mobile`.
- `public/`: Static assets.
- `tailwind.config.ts`: Configuration file for Tailwind CSS, including custom fonts and colors.

## 5. Key Features & Components

### 5.1. Core Layout (`src/app/(app)/layout.tsx`)

- A persistent sidebar for navigation and a header for displaying key account metrics.
- The layout uses a `SidebarProvider` context to manage the sidebar's state (expanded/collapsed).
- **Header:** Displays a real-time summary of P/L, Equity, and Margin Usage.
- **Sidebar:** Contains navigation links to all major features, user profile information, and the app logo.

### 5.2. Dashboard (`/dashboard`)

- **System Status:** Shows the status of data sources (Live vs. Mock).
- **Market Controls:** Allows the user to set a global D-Score threshold to filter the market overview, and includes emergency controls like "Pause All Bots".
- **Market Overview Table:** The primary feature. It displays a real-time, sortable list of currency pairs, their live price, D-Score, and key indicator values.
- **Manual Bot Launcher:** A condensed version of the bot configuration panel for quick launches.

### 5.3. D-Score Detailed (`/d-score-detailed`)

- Provides a transparent, in-depth view of how the final D-Score is constructed.
- The table shows each component of the score (Trend Alignment, ADX Strength, etc.) and its weighted contribution for every currency pair.

### 5.4. Market Detailed (`/market-detailed`)

- Displays the raw, unweighted values calculated for each technical indicator (e.g., raw RSI value, MACD histogram, etc.). This is for advanced users who want to see the underlying data.

### 5.5. Auto Bot Launcher (`/autobot`)

- A dedicated page for configuring and launching new trading bots.
- **Market Filter:** Allows users to find opportunities based on D-Score, quality, and trend.
- **Bot Configuration:** An extensive form to set up every parameter of a new bot, including lot size, grid levels, take profit/stop loss, and advanced features like Trailing Stops and AI Optimization.

### 5.6. Currency Strength Index (`/strength`)

- Fetches data for major currency indices (DXY, EXY, etc.).
- Displays a table showing the closing strength value for the last 10 days for each currency.
- Includes a directional arrow to indicate the trend (up or down) from the previous day.

### 5.7. Other Pages

- **Bots Management:** View, manage, and monitor active and closed bots.
- **Learning Center:** An accordion-style educational section explaining Forex concepts and the D-Score system.
- **News:** An economic calendar to track market-moving events.
- **Analytics:** Displays charts for the account's equity curve and global currency exposure.
- **Accounts & Settings:** Interfaces for linking trading accounts and managing API keys.

## 6. Getting Started & Environment Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    - Create a `.env` file in the root of the project.
    - To use your own private API key, add the following line to the `.env` file:
      ```
      FMP_API_KEY=your_financial_modeling_prep_api_key
      ```
    - If this is not provided, the application will use a public, rate-limited fallback key.
3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.
