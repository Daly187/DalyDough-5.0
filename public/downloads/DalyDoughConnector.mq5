//+------------------------------------------------------------------+
//|                                       DalyDoughConnector.mq5 |
//|                                    Copyright 2024, DalyDough Team |
//|                                             https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, DalyDough Team"
#property link      "https://dalydough.com"
#property version   "1.2"

//--- EA inputs
input string ApiKey             = "PASTE_YOUR_KEY_FROM_DALYDOUGH_APP_HERE"; // Your unique key from the Accounts page
input string API_ENDPOINT       = "https://your-api-endpoint.com/bot-commands"; // The server endpoint to get commands
input int    JsonRefreshSeconds = 15;                                       // How often to check for new commands

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//--- Check for WebRequest permission
   if(!TerminalInfoInteger(TERMINAL_WEBREQUEST))
     {
      Alert("Please enable 'Allow WebRequest for listed URL' in the terminal options.");
      return(INIT_FAILED);
     }
//--- set timer
   EventSetTimer(JsonRefreshSeconds);
   
   long mql5_version = MQL5InfoInteger(MQL5_VERSION);
   Print("DalyDough Connector v",_Symbol," Initialized. MQL5 Build: ", mql5_version);
   Comment("DalyDough Connector Initialized. Waiting for commands...");
   
//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//--- kill timer
   EventKillTimer();
//---
  }
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
//--- Get commands from server
   string headers;
   char post_data[], result_data[];
   string url = API_ENDPOINT + "?key=" + ApiKey;

   ResetLastError();
   int res = WebRequest("GET", url, NULL, NULL, 5000, post_data, 0, result_data, headers);

   if(res == -1)
     {
      Print("WebRequest failed. Error code: ", GetLastError());
      Comment("DalyDough Status: WebRequest Error " + (string)GetLastError());
     }
   else
     {
      // Check HTTP Status Code
      int http_status_code = StringToInteger(StringSubstr(headers, 9, 3));
      if(http_status_code == 200)
        {
         Comment("DalyDough Status: Connected. Last check: " + TimeToString(TimeCurrent()));
         // Here you would parse the JSON from result_data and execute commands
         // Example: string json = CharArrayToString(result_data);
         // Parse and act on json...
        }
      else
        {
         Comment("DalyDough Status: HTTP Error " + (string)http_status_code);
         Print("WebRequest returned HTTP Status ", http_status_code);
        }
     }
  }
//+------------------------------------------------------------------+
