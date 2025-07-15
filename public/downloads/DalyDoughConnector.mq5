
//+------------------------------------------------------------------+
//|                                     DalyDoughConnector.mq5 |
//|                      Copyright 2024, DalyDough Team |
//|                                      https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, DalyDough Team"
#property link      "https://dalydough.com"
#property version   "1.4"

//--- EA inputs
input string ApiKey             = "PASTE_YOUR_KEY_FROM_DALYDOUGH_APP_HERE"; // Your unique key from the Accounts page
input string API_ENDPOINT       = "https://your-api-endpoint.com/bot-commands"; // The server endpoint to get commands
input int    JsonRefreshSeconds = 15;                                       // How often to check for new commands

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//--- Check if WebRequest is allowed
   if(!TerminalInfoInteger(TERMINAL_WEBREQUEST))
     {
      Alert("WebRequest is not enabled. Please go to Tools > Options > Expert Advisors and check 'Allow WebRequest for listed URL'. Add your API endpoint URL there.");
      return(INIT_FAILED);
     }

//--- Print MQL5 version for debugging
   int mql5_version = MQL5InfoInteger(MQL5_VERSION);
   Print("MQL5 Version: ", mql5_version);


//--- Set timer to fetch commands
   EventSetTimer(JsonRefreshSeconds);
   Comment("DalyDough Status: Initialized");

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//--- Kill the timer
   EventKillTimer();
   Comment("DalyDough Status: Stopped");
  }

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
//--- Fetch commands from the server
   FetchCommands();
  }

//+------------------------------------------------------------------+
//| Fetch commands from the server                                   |
//+------------------------------------------------------------------+
void FetchCommands()
  {
   char post_data[], result_data[];
   string result_headers;
   string url = API_ENDPOINT + "?key=" + ApiKey;

   //--- Send GET request
   ResetLastError();
   long retcode = WebRequest("GET", url, NULL, NULL, 5000, post_data, 0, result_data, result_headers);

   //--- Handle response
   if(retcode == -1)
     {
      Print("WebRequest failed. Error code: ", GetLastError());
      Comment("DalyDough Status: Connection Error");
     }
   else if(retcode == 200)
     {
      Comment("DalyDough Status: Connected");
      //--- Convert result to string and process JSON
      string json_response = CharArrayToString(result_data);
      Print("Received response: ", json_response);
      // ProcessJsonResponse(json_response); // Placeholder for future logic
     }
   else
     {
      Print("WebRequest returned status code: ", retcode);
      Comment("DalyDough Status: Error Code " + (string)retcode);
     }
  }
//+------------------------------------------------------------------+
