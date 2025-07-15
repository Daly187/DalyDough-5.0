//+------------------------------------------------------------------+
//|                                     DalyDoughConnector.mq5 |
//|                        Copyright 2024, DalyDough Team |
//|                                  https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, DalyDough Team"
#property link      "https://dalydough.com"
#property version   "1.1"

//--- EA inputs
input string ApiKey             = "PASTE_YOUR_KEY_FROM_DALYDOUGH_APP_HERE"; // Your unique key from the Accounts page
input string API_ENDPOINT       = "https://your-api-endpoint.com/bot-commands"; // The server endpoint to get commands
input int    JsonRefreshSeconds = 15;                                        // How often to check for new commands

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   EventSetTimer(JsonRefreshSeconds);
   Print("DalyDough Connector Initialized. Version ", __MQL5_VERSION__);
   Print("Connecting to: ", API_ENDPOINT);
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   Comment("");
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   // Potentially handle high-frequency updates here if needed in the future
  }
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
   string headers = "Content-Type: application/json\r\n";
   char post_data[], result_data[];
   string result_headers;
   
   string url = API_ENDPOINT + "?key=" + ApiKey;

   int res = WebRequest("GET", url, headers, 5000, post_data, result_data, result_headers);
   
   if(res == -1)
     {
      Print("WebRequest failed. Error code: ", GetLastError());
      Comment("DalyDough Status: Connection Error");
     }
   else
     {
      // --- successful request
      Print("WebRequest successful. Response code: ", res);
      
      // Convert char array to string
      string response_string = CharArrayToString(result_data);
      Print("Response: ", response_string);
      
      // TODO: Add JSON parsing and command handling logic here
      Comment("DalyDough Status: Connected. Last check: " + TimeToString(TimeCurrent(), TIME_SECONDS));
     }
  }
//+------------------------------------------------------------------+
