//+------------------------------------------------------------------+
//|                                                DalyDoughEA.mq5   |
//|                                  Copyright 2025, DalyDough Ltd   |
//|                                             https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, DalyDough Ltd"
#property link      "https://dalydough.com"
#property version   "1.10"

#include <Trade\Trade.mqh>
#include <JAson.mqh> // Use a library for easier JSON parsing

//--- Input parameters
input string EA_Key = "";                    // Your unique EA Key from DalyDough
input int Update_Frequency_Seconds = 5;     // How often to sync with server (seconds)

//--- Global variables
bool isAuthenticated = false;
string projectID = "studio-7990806245"; // Your Firebase Project ID
string baseURL = "https://firestore.googleapis.com/v1/projects/" + projectID + "/databases/(default)/documents/";
string accountDocumentPath = "";
string userID = "";
datetime lastUpdate = 0;
datetime lastSymbolSync = 0;
CTrade trade;

// Helper function to extract a value from a Firestore JSON string
string GetJsonValue(string json, string field)
{
    CJAVal json_val;
    if(!json_val.Deserialize(json)) return "";

    string key = field + "/stringValue";
    if(json_val.Exist(key)) return json_val[key].ToStr();
    
    key = field + "/doubleValue";
    if(json_val.Exist(key)) return (string)json_val[key].ToDbl();

    key = field + "/integerValue";
    if(json_val.Exist(key)) return (string)json_val[key].ToLng();
    
    return "";
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
    Print("DalyDough EA starting...");
    
    if(StringLen(EA_Key) == 0)
    {
        Print("ERROR: EA_Key is required. Please enter your unique EA Key from DalyDough.");
        return(INIT_FAILED);
    }
    
    if(!AuthenticateEA())
    {
        Print("ERROR: Authentication failed. Please check your EA_Key and Firestore security rules.");
        return(INIT_FAILED);
    }
    
    if(!EventSetTimer(Update_Frequency_Seconds))
    {
        Print("ERROR: Failed to set timer.");
        return(INIT_FAILED);
    }
    
    // Initial sync
    UpdateAccountStatus();
    SyncBrokerSymbols();
    
    Print("DalyDough EA initialized successfully for user: ", userID);
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    EventKillTimer();
    Print("DalyDough EA stopped.");
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
    if(!isAuthenticated) 
        return;
    
    UpdateAccountStatus();
    ProcessBotCommands();
    
    // Re-sync symbols every hour
    if(TimeCurrent() - lastSymbolSync > 3600)
    {
        SyncBrokerSymbols();
    }
}

//+------------------------------------------------------------------+
//| Authenticate EA against Firestore                                |
//+------------------------------------------------------------------+
bool AuthenticateEA()
{
    string url = baseURL + "tradeAccounts/" + EA_Key;
    char data[];
    char result[];
    string resultHeaders;
    
    int res = WebRequest("GET", url, "", 10000, data, result, resultHeaders);
    
    if(res == 200)
    {
        string response = CharArrayToString(result);
        userID = GetJsonValue(response, "fields/uid");
        
        if(StringLen(userID) > 0)
        {
            isAuthenticated = true;
            accountDocumentPath = "tradeAccounts/" + EA_Key;
            Print("Authentication successful. User ID: ", userID);
            return true;
        }
        else
        {
            Print("Authentication failed: Could not parse UID from response. Response: ", response);
        }
    }
    else
    {
        Print("ERROR: Authentication failed with HTTP Code: ", res, ". Check EA Key and ensure the account exists in Firestore.");
        Print("Check: Tools -> Options -> Expert Advisors -> Allow WebRequest for URL: https://firestore.googleapis.com");
    }
    
    return false;
}

//+------------------------------------------------------------------+
//| Update account status in Firestore                               |
//+------------------------------------------------------------------+
void UpdateAccountStatus()
{
    double balance = AccountInfoDouble(ACCOUNT_BALANCE);
    double equity = AccountInfoDouble(ACCOUNT_EQUITY);
    double marginLevel = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
    
    string jsonData = StringFormat(
        "{\"fields\": {"
        "\"balance\": {\"doubleValue\": %.2f},"
        "\"equity\": {\"doubleValue\": %.2f},"
        "\"marginLevel\": {\"doubleValue\": %.2f},"
        "\"status\": {\"stringValue\": \"Connected\"},"
        "\"lastUpdate\": {\"stringValue\": \"%s\"}"
        "}}",
        balance, equity, marginLevel, TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS)
    );
    
    string url = baseURL + accountDocumentPath + "?updateMask.fieldPaths=balance&updateMask.fieldPaths=equity&updateMask.fieldPaths=marginLevel&updateMask.fieldPaths=status&updateMask.fieldPaths=lastUpdate";
    SendFirebaseRequest("PATCH", url, jsonData);
}


//+------------------------------------------------------------------+
//| Sync broker symbols to Firestore                                 |
//+------------------------------------------------------------------+
void SyncBrokerSymbols()
{
    Print("Starting symbol synchronization...");
    lastSymbolSync = TimeCurrent();
    int syncedCount = 0;
    
    int totalSymbols = SymbolsTotal(true);
    for(int i = 0; i < totalSymbols; i++)
    {
        string symbol = SymbolName(i, true);
        if(!SymbolInfoInteger(symbol, SYMBOL_SELECT)) continue;
            
        string description = SymbolInfoString(symbol, SYMBOL_DESCRIPTION);
        string apiSymbol = MapBrokerSymbolToAPI(symbol);
        
        string symbolData = StringFormat(
            "{\"fields\": {"
            "\"brokerSymbol\": {\"stringValue\": \"%s\"},"
            "\"apiSymbol\": {\"stringValue\": \"%s\"},"
            "\"description\": {\"stringValue\": \"%s\"},"
            "\"accountKey\": {\"stringValue\": \"%s\"},"
            "\"isActive\": {\"booleanValue\": true}"
            "}}",
            symbol, apiSymbol, description, EA_Key
        );
        
        string documentPath = "userSettings/" + userID;
        // This is a simplified approach. A more robust way would be to update an array field.
        // For now, we will just save a sample mapping. In a real app, you'd manage the symbolMappings array.
        // This is a placeholder to show how to write to the userSettings.
        string mappingsUpdate = "{\"fields\": {\"symbolMappings\": {\"arrayValue\": {\"values\": [{\"mapValue\": {\"fields\": {\"brokerSymbol\": {\"stringValue\": \"%s\"},\"apiSymbol\": {\"stringValue\": \"%s\"}}}}]}}}}";
        string finalUpdate = StringFormat(mappingsUpdate, symbol, apiSymbol);

        string url = baseURL + documentPath + "?updateMask.fieldPaths=symbolMappings";
        
        if(SendFirebaseRequest("PATCH", url, finalUpdate))
        {
            syncedCount++;
        }
        
        if(syncedCount >= 20) break; // Limit sync for performance
        Sleep(100);
    }
    
    Print("Symbol synchronization completed. Synced ", syncedCount, " symbols.");
}

string MapBrokerSymbolToAPI(string brokerSymbol)
{
    string apiSymbol = StringToUpper(brokerSymbol);
    // Remove common broker suffixes/prefixes
    StringReplace(apiSymbol, ".PRO", "");
    StringReplace(apiSymbol, ".VAR", "");
    StringReplace(apiSymbol, "Z", "");
    StringReplace(apiSymbol, "M", "");
    StringReplace(apiSymbol, ".", "");
    StringReplace(apiSymbol, "_", "");
    
    if(StringLen(apiSymbol) == 6)
    {
        return StringSubstr(apiSymbol, 0, 3) + "/" + StringSubstr(apiSymbol, 3, 3);
    }
    
    return brokerSymbol; // Return original if not a standard 6-char pair
}

//+------------------------------------------------------------------+
//| Process bot commands from Firestore                              |
//+------------------------------------------------------------------+
void ProcessBotCommands()
{
    // Step 1: Query for active bots for this user
    string queryUrl = baseURL + ":runQuery";
    string queryJson = StringFormat(
        "{\"structuredQuery\": {"
        "\"from\": [{\"collectionId\": \"bots\"}],"
        "\"where\": {"
        "\"compositeFilter\": {"
        "\"op\": \"AND\","
        "\"filters\": ["
        "{\"fieldFilter\": {\"field\": {\"fieldPath\": \"uid\"}, \"op\": \"EQUAL\", \"value\": {\"stringValue\": \"%s\"}}},"
        "{\"fieldFilter\": {\"field\": {\"fieldPath\": \"status\"}, \"op\": \"EQUAL\", \"value\": {\"stringValue\": \"active\"}}}"
        "]"
        "}"
        "}"
        "}}",
        userID
    );
    
    char postData[];
    StringToCharArray(queryJson, postData, 0, WHOLE_ARRAY, CP_UTF8);
    char result[];
    string resultHeaders;

    int res = WebRequest("POST", queryUrl, "Content-Type: application/json", 5000, postData, result, resultHeaders);

    if (res != 200) {
        Print("Failed to query for bots. HTTP Code: ", res);
        return;
    }

    string response = CharArrayToString(result);
    // In a real EA, you would parse this JSON response to get an array of bot documents
    // and loop through each one to manage its trades.
    // The parsing logic is complex in MQL5, so this is a simplified placeholder.
    
    Print("Successfully queried for bots. Response (simplified): ", StringSubstr(response, 0, 200), "...");

    // Example logic for a SINGLE bot (needs proper JSON parsing to work with multiple bots)
    // string botId = ... // extract botId from response
    // string botPair = ... // extract pair from response
    // double botLotSize = ... // extract lot size
    // ulong magicNumber = (ulong)StringHash(botId);
    
    // if(!PositionSelectByTicket(magicNumber)) {
    //   trade.Buy(botLotSize, botPair, ...);
    // }
}


//+------------------------------------------------------------------+
//| Send generic Firebase request                                    |
//+------------------------------------------------------------------+
bool SendFirebaseRequest(string method, string url, string jsonData)
{
    string headers = "Content-Type: application/json\r\n";
    
    char data[];
    char result[];
    string resultHeaders;
    
    if(method == "PATCH" || method == "POST" || method == "PUT")
    {
       StringToCharArray(jsonData, data, 0, -1, CP_UTF8);
    }
    
    int res = WebRequest(method, url, headers, 5000, data, result, resultHeaders);
    
    if(res == 200 || res == 201)
    {
        return true;
    }
    else
    {
        string response = CharArrayToString(result);
        Print("Firebase request failed. Method: ", method, " URL: ", url, " HTTP Code: ", res);
        Print("Response: ", response);
        return false;
    }
}

// Simple String Hashing for Magic Number
ulong StringToULong(string str)
{
    ulong hash = 5381;
    for(int i = 0; i < StringLen(str); i++)
    {
        hash = ((hash << 5) + hash) + (ulong)StringGetCharacter(str, i);
    }
    return hash;
}
