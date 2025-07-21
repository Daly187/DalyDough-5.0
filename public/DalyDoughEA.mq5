//+------------------------------------------------------------------+
//|                                                DalyDoughEA.mq5   |
//|                                  Copyright 2025, DalyDough Ltd   |
//|                                             https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, DalyDough Ltd"
#property link      "https://dalydough.com"
#property version   "1.10"

#include <Trade\Trade.mqh>

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

// Simple helper function to extract string values from Firestore JSON
string ExtractStringValue(string json, string fieldName)
{
    string searchFor = "\"" + fieldName + "\":{\"stringValue\":\"";
    int pos = StringFind(json, searchFor);
    if(pos == -1) return "";
    
    pos += StringLen(searchFor);
    int endPos = StringFind(json, "\"", pos);
    if(endPos == -1) return "";
    
    return StringSubstr(json, pos, endPos - pos);
}

// Simple helper function to extract double values from Firestore JSON
double ExtractDoubleValue(string json, string fieldName)
{
    string searchFor = "\"" + fieldName + "\":{\"doubleValue\":";
    int pos = StringFind(json, searchFor);
    if(pos == -1) return 0.0;
    
    pos += StringLen(searchFor);
    int endPos = StringFind(json, "}", pos);
    if(endPos == -1) return 0.0;
    
    string valueStr = StringSubstr(json, pos, endPos - pos);
    return StringToDouble(valueStr);
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
        userID = ExtractStringValue(response, "uid");
        
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
    string lastUpdateTime = TimeToString(TimeCurrent(), TIME_RFC3339);

    string jsonData = StringFormat(
        "{\"fields\": {"
        "\"balance\": {\"doubleValue\": %.2f},"
        "\"equity\": {\"doubleValue\": %.2f},"
        "\"marginLevel\": {\"doubleValue\": %.2f},"
        "\"status\": {\"stringValue\": \"Connected\"},"
        "\"lastUpdate\": {\"stringValue\": \"%s\"}"
        "}}",
        balance, equity, marginLevel, lastUpdateTime
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
    
    // Create array of symbol mappings
    string symbolMappingsJson = "\"symbolMappings\": {\"arrayValue\": {\"values\": [";
    
    int totalSymbols = SymbolsTotal(true);
    for(int i = 0; i < totalSymbols; i++) // Removed the i < 20 limit
    {
        string symbol = SymbolName(i, true);
        if(!SymbolInfoInteger(symbol, SYMBOL_SELECT)) continue;
            
        string description = SymbolInfoString(symbol, SYMBOL_DESCRIPTION);
        string apiSymbol = MapBrokerSymbolToAPI(symbol);
        
        if(syncedCount > 0) symbolMappingsJson += ",";
        
        symbolMappingsJson += StringFormat(
            "{\"mapValue\": {\"fields\": {"
            "\"brokerSymbol\": {\"stringValue\": \"%s\"},"
            "\"apiSymbol\": {\"stringValue\": \"%s\"},"
            "\"description\": {\"stringValue\": \"%s\"}"
            "}}}",
            symbol, apiSymbol, description
        );
        
        syncedCount++;
        Sleep(50); // Small delay to avoid overwhelming the API
    }
    
    symbolMappingsJson += "]}}";
    
    string finalUpdate = "{\"fields\": {" + symbolMappingsJson + "}}";
    string documentPath = "userSettings/" + userID;
    string url = baseURL + documentPath + "?updateMask.fieldPaths=symbolMappings";
    
    if(SendFirebaseRequest("PATCH", url, finalUpdate))
    {
        Print("Symbol synchronization completed. Synced ", syncedCount, " symbols.");
    }
    else
    {
        Print("Symbol synchronization failed.");
    }
}

//+------------------------------------------------------------------+
//| Map broker symbol to API format                                  |
//+------------------------------------------------------------------+
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
    // Query for active bots for this user
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
    // Print("Successfully queried for bots. Response length: ", StringLen(response));
    
    // Simple bot processing - this would need more complex JSON parsing for multiple bots
    if(StringFind(response, "\"documents\"") != -1)
    {
        // This is a placeholder. In a real scenario, you'd loop through each document in the response.
        // For now, we'll just process the first one found for demonstration.
        string botPair = ExtractStringValue(response, "pair");
        double lotSize = ExtractDoubleValue(response, "lotSize");
        string strategy = ExtractStringValue(response, "strategy");
        
        if(StringLen(botPair) > 0 && lotSize > 0)
        {
            // Print("Processing bot for pair: ", botPair, " with lot size: ", lotSize);
            // Add your trading logic here
            ExecuteBotStrategy(botPair, lotSize, strategy);
        }
    }
}

//+------------------------------------------------------------------+
//| Execute bot trading strategy                                      |
//+------------------------------------------------------------------+
void ExecuteBotStrategy(string pair, double lotSize, string strategy)
{
    // This is a placeholder for your actual trading logic.
    // It should check the bot's direction, manage pending orders, check for close signals, etc.
    
    // Example:
    // if(strategy == "Dynamic DCA") { ... }
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
        Print("Firebase request failed. Method: ", method, " HTTP Code: ", res);
        Print("URL: ", url);
        Print("Response: ", StringSubstr(response, 0, 400)); // Limit response length
        return false;
    }
}
