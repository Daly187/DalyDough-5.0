//+------------------------------------------------------------------+
//|                                              DalyDoughEA.mq5 |
//|                      Copyright 2024, DalyDough Team |
//|                                      https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, DalyDough Team"
#property link      "https://dalydough.com"
#property version   "1.5"

//--- EA inputs
input string ApiKey          = "PASTE_YOUR_KEY_FROM_DALYDOUGH_APP_HERE"; // Your unique key from the Accounts page
input string AppBaseUrl      = "https://your-app-url.web.app";   // The URL of your deployed DalyDough app
input int    RefreshSeconds  = 15;                               // How often to check for new commands

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("DalyDough Connector Starting...");
   EventSetTimer(RefreshSeconds);
   Comment("DalyDough Status: Initialized");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   Comment("DalyDough Status: Stopped");
  }

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
   FetchCommands();
  }

//+------------------------------------------------------------------+
//| Fetch commands from the server                                   |
//+------------------------------------------------------------------+
void FetchCommands()
  {
   char post_data[], result_data[];
   string result_headers;
   string url = AppBaseUrl + "/api/bot-commands?key=" + ApiKey;
   
   ResetLastError();
   int retcode = WebRequest("GET", url, NULL, NULL, 5000, post_data, 0, result_data, result_headers);
   
   if(retcode == -1)
     {
      Print("WebRequest failed. Error code: ", GetLastError());
      Comment("DalyDough Status: Connection Error " + (string)GetLastError());
     }
   else if(retcode == 200)
     {
      Comment("DalyDough Status: Connected");
      string json_response = CharArrayToString(result_data);
      Print("Received response: ", json_response);
      // Future logic to parse JSON and execute commands will go here.
     }
   else
     {
      Print("WebRequest returned status code: ", retcode);
      Comment("DalyDough Status: HTTP Error " + (string)retcode);
     }
  }
