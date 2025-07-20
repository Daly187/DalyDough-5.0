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
- **Automated Scanning**: **Google Cloud Scheduler** is used to trigger an API route (`/api/autobot/scan`) on a recurring schedule to perform automated market scanning and bot creation.

## 3. Architecture & Data Flow

The application's architecture is designed to be modular and scalable, with a clear separation of concerns between data fetching, data processing, and UI presentation.

### 3.1. Data Fetching Layer

- **Source:** All market data is sourced from the **Financial Modeling Prep (FMP) API**.
- **API Module (`src/lib/api/fmp-api.ts`):** This is the single point of contact with the external FMP API.
    - It contains a `fetchWithCache` function that provides simple in-memory caching to avoid redundant API calls. The cache TTL is set to 10 minutes.
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
    - `bots/page.tsx`: Page for managing active trading bots and pending orders.
    - `closed-bots/page.tsx`: Page for reviewing historical closed bots.
    - `autobot/page.tsx`: The interface for configuring and launching new trading bots.
    - `... (other pages)`
- `src/app/api/autobot/`: Contains API routes for the Auto Bot feature.
    - `scan/route.ts`: The endpoint triggered by Cloud Scheduler to run the automated scanner.
    - `strategy/route.ts`: Endpoint for saving and retrieving the user's Auto Bot strategy.
- `src/app/page.tsx`: The public-facing landing page.
- `src/components`: Contains all reusable React components.
- `src/lib`: Houses the core business logic, data definitions, and utilities.
- `src/hooks`: Custom React hooks, such as `use-toast` and `use-mobile`.
- `public/`: Static assets.
- `tailwind.config.ts`: Configuration file for Tailwind CSS.

## 5. Key Features & Components

### 5.1. Auto Bot Launcher & Scanner (`/autobot`)

- A dedicated page for defining the global automated trading strategy.
- Users configure entry/exit D-Score thresholds and a complete bot template (lot size, grid levels, etc.).
- An API route at `/api/autobot/scan` contains the logic to:
    1.  Fetch the saved strategy.
    2.  Scan the market for all included pairs.
    3.  Check for matching D-Scores against entry criteria.
    4.  Verify no active auto-bot exists for the pair.
    5.  Create a new bot in Firestore if all conditions are met.
- This API route is designed to be called by an external scheduler like **Google Cloud Scheduler**.

## 6. Getting Started & Environment Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    - Create a `.env` file in the root of the project for local development.
    - To use your own private FMP API key, add the following line:
      ```
      FMP_API_KEY=your_financial_modeling_prep_api_key
      ```
    - Add your Firebase project configuration variables to this file.
3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:9002](http://localhost:9002) in your browser.

## 7. Setting Up Automated Scanning (Cloud Scheduler)

To make the Auto Bot feature fully automatic, you need to configure a cron job to call the scanner API route. This is the final step to enable the automated trading functionality.

1.  **Find your Deployed URL**: After deploying your application to Firebase Hosting, you will get a URL. Your project ID is `studio-7990806245`, so your URL will be `https://studio-7990806245.web.app`.

2.  **Go to Cloud Scheduler**: Open the [Google Cloud Scheduler](https://console.cloud.google.com/cloudscheduler) page. Make sure the correct project is selected.

3.  **Click "Create Job"**:
    *   **Name**: Give it a memorable name, like `dalydough-autobot-scanner`.
    *   **Frequency**: To run every 10 minutes, enter `*/10 * * * *` in the field.
    *   **Timezone**: Select `(UTC+00:00) Coordinated Universal Time` (or "UTC").
    *   Click **"Continue"**.

4.  **Configure Execution**:
    *   **Target type**: Select **HTTP**.
    *   **URL**: Enter your full deployed URL from step 1, followed by the API path: `https://studio-7990806245.web.app/api/autobot/scan`
    *   **HTTP method**: Select **POST**.
    *   **Headers**: Click **"Add Header"**.
        *   Header name: `x-internal-cron`
        *   Header value: `true`
      This header is a security measure to verify the request is coming from your trusted scheduler.

5.  **Create the Job**: Click the **"Create"** button at the bottom.

Your Auto Bot is now fully automated and will scan the market according to your saved strategy. You can use the "FORCE RUN" button in the Cloud Scheduler dashboard to test it immediately.
```