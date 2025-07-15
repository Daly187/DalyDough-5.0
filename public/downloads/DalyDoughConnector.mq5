//+------------------------------------------------------------------+
//|                                           DalyDoughConnector.mq5 |
//|                             Copyright 2024, DalyDough AI Assistant |
//|                                             https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, DalyDough AI Assistant"
#property link      "https://your-app-url.com"
#property version   "1.00"
#property expert_version "1.00"
#property description "Connects MetaTrader 5 to the DalyDough AI platform."

//--- input parameters for the user to fill in the EA settings
input string InpApiKey     = "YOUR_UNIQUE_EA_KEY";                     // Your Unique EA Key from DalyDough
input string InpApiBaseUrl = "https://your-dalydough-backend.com/api"; // API Base URL (do not change unless instructed)

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//| This runs once when the EA is first attached to a chart.         |
//+------------------------------------------------------------------+
int OnInit()
  {
//---
   Print("DalyDough Connector initializing...");
   
   //--- Check if WebRequest is allowed in MT5 settings
   long term_info;
   if(!TerminalInfoInteger(TERMINAL_WEBREQUEST_ALLOWED, term_info) || term_info == 0)
     {
      Print("WebRequest is not allowed. Please enable 'Allow WebRequest for listed URL' in Tools -> Options -> Expert Advisors, and add '", InpApiBaseUrl, "'.");
      Alert("WebRequest is not allowed. Please enable it in MT5 options.");
      return(INIT_FAILED);
     }

   //--- Send a registration request to the backend
   string endpoint = "/register";
   string post_data = "{\"account_number\":" + (string)AccountInfoInteger(ACCOUNT_LOGIN) + ", \"api_key\":\"" + InpApiKey + "\"}";
   string headers = "Content-Type: application/json\r\n";
   char post_result[];
   int timeout = 5000; // 5 seconds

   int res = WebRequest("POST", InpApiBaseUrl + endpoint, headers, timeout, post_data, post_result, headers);

   if(res == -1)
     {
      Print("Error in WebRequest: ", GetLastError());
      Alert("Failed to connect to DalyDough server. Check Journal for details.");
      return(INIT_FAILED);
     }
   else
     {
      //--- Check response code
      string response_headers_str = CharArrayToString(headers);
      if(StringFind(response_headers_str, " 200 OK") > 0)
        {
         Print("Successfully connected to DalyDough server. Response: ", CharArrayToString(post_result));
         ChartIndicatorAdd(0, 0, IndicatorCreate(_Symbol, PERIOD_CURRENT, IND_CUSTOM, 0, "DalyDough Status: Connected"));
        }
      else
        {
         Print("Failed to connect. Server response: ", CharArrayToString(post_result));
         Print("Response headers: ", response_headers_str);
         Alert("Connection to DalyDough failed. Check API key and server URL. Full response in Journal.");
         return(INIT_FAILED);
        }
     }
   
   Print("DalyDough Connector initialized successfully.");
//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//| This runs when the EA is removed from the chart.                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//---
   Print("DalyDough Connector deinitializing. Reason: ", reason);
//---
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//| This runs on every new price tick for the chart's symbol.        |
//+------------------------------------------------------------------+
void OnTick()
  {
//---
// Future logic will go here, e.g., sending trade updates,
// checking for new signals, etc.
//---
  }
//+------------------------------------------------------------------+
