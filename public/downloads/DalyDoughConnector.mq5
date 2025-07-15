//+------------------------------------------------------------------+
//|                                     DalyDoughConnector.mq5 |
//|                      Copyright 2024, DalyDough AI Assistant |
//|                                     https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, DalyDough AI Assistant"
#property link      "https://your-app-url.com"
#property version   "1.01"
#property description "Connects MetaTrader 5 to the DalyDough AI platform."

//--- input parameters for the user to fill in the EA settings
input string InpApiKey       = "YOUR_UNIQUE_EA_KEY";                 // Your Unique EA Key from DalyDough
input string InpApiBaseUrl   = "https://your-dalydough-backend.com/api"; // API Base URL (do not change unless instructed)
input int    InpUpdateRate   = 5;                                      // Update frequency (in seconds)

//--- global variables
string ApiKey;
string ApiBaseUrl;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   //--- Set global variables from inputs
   ApiKey = InpApiKey;
   ApiBaseUrl = InpApiBaseUrl;

   //--- Check if API key is set
   if(ApiKey == "YOUR_UNIQUE_EA_KEY" || ApiKey == "")
     {
      Print("DalyDough Error: API Key is not set. Please enter your key in the EA settings.");
      ExpertRemove();
      return(INIT_FAILED);
     }

   //--- Set timer to poll for commands
   EventSetTimer(InpUpdateRate);
   
   Comment("DalyDough EA Initialized. Waiting for connection...");

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   //--- Kill the timer
   EventKillTimer();
   Comment(""); // Clear the comment on exit
  }

//+------------------------------------------------------------------+
//| Expert tick function (not used for this EA)                      |
//+------------------------------------------------------------------+
void OnTick()
  {
   //---
  }

//+------------------------------------------------------------------+
//| Timer function - This is where we communicate with the server    |
//+------------------------------------------------------------------+
void OnTimer()
  {
   string headers = "Content-Type: application/json\r\n";
   char post_data[], result_data[];
   string result_headers;
   string url = ApiBaseUrl + "?key=" + ApiKey;
   
   //--- Reset the last error code
   ResetLastError();

   //--- Send a GET request to the server to fetch commands
   int res = WebRequest("GET", url, headers, 5000, post_data, result_data, result_headers);

   //--- Check for errors
   if(res == -1)
     {
      Print("WebRequest failed. Error code: ", GetLastError());
      Comment("DalyDough Status: Connection Error " + (string)GetLastError());
     }
   else
     {
      if(res == 200)
        {
         //--- Successful request
         string server_response = CharArrayToString(result_data);
         Comment("DalyDough Status: Connected\n" + server_response);
         // Here you would parse the JSON response and execute commands
         // For example: if (json.action == "LAUNCH") { OrderSend(...) }
        }
      else
        {
         //--- Request failed with a specific HTTP status code
         Print("WebRequest returned status code: ", res);
         Comment("DalyDough Status: HTTP Error " + (string)res);
        }
     }
  }
//+------------------------------------------------------------------+
