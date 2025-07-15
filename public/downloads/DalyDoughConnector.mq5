//+------------------------------------------------------------------+
//|                                       DalyDoughConnector.mq5 |
//|                      Copyright 2024, DalyDough Team |
//|                                     https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, DalyDough Team"
#property link      "https://dalydough.com"
#property version   "1.3"

//--- EA inputs
input string ApiKey             = "PASTE_YOUR_KEY_FROM_DALYDOUGH_APP_HERE"; // Your unique key from the Accounts page
input string API_ENDPOINT       = "https://your-api-endpoint.com/bot-commands"; // The server endpoint to get commands
input int    JsonRefreshSeconds = 15;                                        // How often to check for new commands

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
    //--- Check for WebRequest permission
    if(!TerminalInfoInteger(TERMINAL_WEB_REQUEST_ALLOWED))
    {
        Alert("WebRequest is not allowed. Please enable 'Allow WebRequest for listed URL' in Terminal options.");
        return(INIT_FAILED);
    }
    
    //--- Print MQL5 version to the log for debugging
    PrintFormat("MQL5 Version: %d", MQL5InfoInteger(MQL5_PROGRAM_VERSION));

    //--- Start a timer to fetch commands periodically
    EventSetTimer(JsonRefreshSeconds);
    
    Comment("DalyDough Connector: Initialized. Waiting for first tick...");
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    //--- Stop the timer
    EventKillTimer();
    Comment("");
    Print("DalyDough Connector: Deinitialized.");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
    //--- For this EA, all logic is handled in the OnTimer function
    //--- to avoid sending too many requests on every tick.
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
    string url = API_ENDPOINT + "?key=" + ApiKey;
    char post_data[];
    char result_data[];
    string result_headers;
    long retcode;

    //--- Reset the last error code
    ResetLastError();

    //--- Perform the web request
    retcode = WebRequest("GET", url, NULL, NULL, 5000, post_data, 0, result_data, result_headers);

    //--- Check for errors
    if(retcode == -1)
    {
        Print("WebRequest failed. Error code: ", GetLastError());
        Comment("DalyDough Status: WebRequest Error " + (string)GetLastError());
    }
    else
    {
        //--- Process successful request
        if(retcode == 200)
        {
            string response = CharArrayToString(result_data);
            Comment("DalyDough Status: Connected. Last check: " + TimeToString(TimeCurrent()));
            // TODO: Add JSON parsing and command execution logic here
            // Print("Received data: ", response);
        }
        else
        {
            Comment("DalyDough Status: HTTP Error " + (string)retcode);
            Print("WebRequest returned HTTP status ", retcode);
        }
    }
}
//+------------------------------------------------------------------+
