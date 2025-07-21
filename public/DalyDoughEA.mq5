//+------------------------------------------------------------------+
//|                                                DalyDoughEA.mq5   |
//|                                  Copyright 2025, DalyDough Ltd   |
//|                                             https://dalydough.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, DalyDough Ltd"
#property link      "https://dalydough.com"
#property version   "1.21"

#include <Trade\Trade.mqh>

//--- Input parameters
input string EA_Key = "";  // PASTE YOUR KEY HERE - Get this from the DalyDough Accounts page
input string Firebase_Project_ID = "studio-7990806245";  // Your Firebase Project ID
input string Firebase_API_Key = "AIzaSyDFf3g984whrO93847gfeirfefg_ADDiw";  // Your Firebase API Key
input int Update_Frequency_Seconds = 60;        // How often to sync with server (seconds)

//--- Global variables
bool isAuthenticated = false;
string baseURL = "";
string accountDocumentPath = "";
string userID = "";
datetime lastUpdate = 0;
datetime lastSymbolSync = 0;
CTrade trade;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
    Print("=== DalyDough EA Working Version Starting ===");
    Print("EA_Key: ", EA_Key);
    Print("Firebase_Project_ID: ", Firebase_Project_ID);
    
    // Build the base URL with the project ID
    baseURL = "https://firestore.googleapis.com/v1/projects/" + Firebase_Project_ID + "/databases/(default)/documents/";
    Print("Base URL: ", baseURL);
    
    if(StringLen(EA_Key) == 0)
    {
        Print("ERROR: EA_Key is required.");
        return(INIT_FAILED);
    }
    
    if(!AuthenticateEA())
    {
        Print("ERROR: Authentication failed.");
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
    
    Print("=== DalyDough EA initialized successfully ===");
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
    
    Print("Timer tick - updating account status...");
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
    Print("Attempting authentication...");
    
    string url = baseURL + "tradeAccounts/" + EA_Key + "?key=" + Firebase_API_Key;
    Print("Request URL: ", url);
    
    char data[];
    char result[];
    string resultHeaders;
    
    int res = WebRequest("GET", url, "", 10000, data, result, resultHeaders);
    
    Print("Authentication HTTP Code: ", res);
    
    if(res == 200)
    {
        string response = CharArrayToString(result);
        Print("✓ Document found successfully");
        
        // Try to find uid field first
        userID = ExtractStringValue(response, "uid");
        
        if(StringLen(userID) > 0)
        {
            Print("✓ Found UID field: ", userID);
        }
        else
        {
            // No uid field, but document exists - use accountId or EA_Key as fallback
            string accountId = ExtractStringValue(response, "accountId");
            if(StringLen(accountId) > 0)
            {
                userID = accountId;
                Print("✓ Using accountId as user ID: ", userID);
            }
            else
            {
                userID = EA_Key; // Use EA_Key as fallback
                Print("✓ Using EA_Key as user ID: ", userID);
            }
        }
        
        isAuthenticated = true;
        accountDocumentPath = "tradeAccounts/" + EA_Key;
        Print("✓ Authentication successful. User ID: ", userID);
        return true;
    }
    else if(res == 404)
    {
        Print("✗ Document not found. EA_Key: ", EA_Key);
        Print("Make sure the document exists in Firebase tradeAccounts collection");
    }
    else if(res == 403)
    {
        Print("✗ Access denied. Check Firestore security rules or API key");
    }
    else
    {
        Print("✗ HTTP ", res, " - Authentication failed");
        string response = CharArrayToString(result);
        Print("Error response: ", StringSubstr(response, 0, 200));
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
    
    Print("Account Info - Balance: ", balance, " Equity: ", equity, " Margin: ", marginLevel);
    
    // Create clean strings for all values
    string balanceStr = DoubleToString(balance, 2);
    string equityStr = DoubleToString(equity, 2);
    string marginStr = DoubleToString(marginLevel, 2);
    string timeStr = TimeToString(TimeCurrent(), TIME_RFC3339);
    
    // Clean all strings
    StringReplace(balanceStr, " ", "");
    StringReplace(equityStr, " ", "");
    StringReplace(marginStr, " ", "");
    StringTrimLeft(balanceStr);
    StringTrimRight(balanceStr);
    StringTrimLeft(equityStr);
    StringTrimRight(equityStr);
    StringTrimLeft(marginStr);
    StringTrimRight(marginStr);
    
    // Build complete JSON with all fields
    string jsonData = "{\"fields\":{";
    jsonData += "\"balance\":{\"doubleValue\":" + balanceStr + "},";
    jsonData += "\"equity\":{\"doubleValue\":" + equityStr + "},";
    jsonData += "\"marginLevel\":{\"doubleValue\":" + marginStr + "},";
    jsonData += "\"status\":{\"stringValue\":\"Connected\"},";
    jsonData += "\"lastUpdate\":{\"stringValue\":\"" + timeStr + "\"}";
    jsonData += "}}";
    
    Print("Complete JSON: ", jsonData);
    
    // Update all fields
    string url = baseURL + accountDocumentPath + "?updateMask.fieldPaths=balance&updateMask.fieldPaths=equity&updateMask.fieldPaths=marginLevel&updateMask.fieldPaths=status&updateMask.fieldPaths=lastUpdate&key=" + Firebase_API_Key;
    
    if(SendFirebaseRequest("PATCH", url, jsonData))
    {
        Print("✓ Account status updated successfully");
    }
    else
    {
        Print("✗ Account status update failed");
    }
}

//+------------------------------------------------------------------+
//| Send Firebase request with clean encoding                        |
//+------------------------------------------------------------------+
bool SendFirebaseRequest(string method, string url, string jsonData)
{
    Print("Sending ", method, " request...");
    Print("URL: ", StringSubstr(url, 0, 100), "...");
    
    string headers = "Content-Type: application/json\r\n";
    
    char data[];
    char result[];
    string resultHeaders;
    
    if(method == "PATCH" || method == "POST" || method == "PUT")
    {
        // Clean the JSON string before converting to char array
        string cleanJson = jsonData;
        StringReplace(cleanJson, "\n", "");
        StringReplace(cleanJson, "\r", "");
        StringReplace(cleanJson, "\t", "");
        
        // Convert to char array with proper encoding
        int len = StringToCharArray(cleanJson, data, 0, WHOLE_ARRAY, CP_UTF8);
        if(len > 0)
        {
            ArrayResize(data, len - 1); // Remove null terminator
        }
        
        Print("Sending data length: ", ArraySize(data));
    }
    
    int res = WebRequest(method, url, headers, 10000, data, result, resultHeaders);
    
    Print("Response HTTP Code: ", res);
    
    if(res == 200 || res == 201)
    {
        Print("✓ Request successful");
        return true;
    }
    else
    {
        string response = CharArrayToString(result);
        Print("✗ Request failed - Response: ", StringSubstr(response, 0, 300));
        return false;
    }
}

//+------------------------------------------------------------------+
//| Simple helper function to extract string values from JSON        |
//+------------------------------------------------------------------+
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

//+------------------------------------------------------------------+
//| Simple helper function to extract double values from Firestore JSON
//+------------------------------------------------------------------+
double ExtractDoubleValue(string json, string fieldName)
{
    string searchFor = "\"" + fieldName + "\":{\"doubleValue\":";
    int pos = StringFind(json, searchFor);
     if(pos == -1) 
     {
        searchFor = "\"" + fieldName + "\":{\"integerValue\":\"";
        pos = StringFind(json, searchFor);
        if(pos == -1) return 0.0;
        pos += StringLen(searchFor);
        int endPos = StringFind(json, "\"", pos);
        if(endPos == -1) return 0.0;
        string valueStr = StringSubstr(json, pos, endPos - pos);
        return (double)StringToInteger(valueStr);
     }
    
    pos += StringLen(searchFor);
    int endPos = StringFind(json, "}", pos);
    if(endPos == -1) return 0.0;
    
    string valueStr = StringSubstr(json, pos, endPos - pos);
    return StringToDouble(valueStr);
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
    string symbolMappingsJson = "\"symbolMappings\":{\"arrayValue\":{\"values\":[";
    
    int totalSymbols = SymbolsTotal(true);
    for(int i = 0; i < totalSymbols; i++) // Removed the limit of 20
    {
        string symbol = SymbolName(i, true);
        if(!SymbolInfoInteger(symbol, SYMBOL_SELECT)) continue;
            
        string description = SymbolInfoString(symbol, SYMBOL_DESCRIPTION);
        string apiSymbol = MapBrokerSymbolToAPI(symbol);
        
        // Clean description string to avoid JSON issues
        StringReplace(description, "\"", "");
        StringReplace(description, "\\", "");
        
        if(syncedCount > 0) symbolMappingsJson += ",";
        
        symbolMappingsJson += "{\"mapValue\":{\"fields\":{";
        symbolMappingsJson += "\"brokerSymbol\":{\"stringValue\":\"" + symbol + "\"},";
        symbolMappingsJson += "\"apiSymbol\":{\"stringValue\":\"" + apiSymbol + "\"},";
        symbolMappingsJson += "\"description\":{\"stringValue\":\"" + description + "\"}";
        symbolMappingsJson += "}}}";
        
        syncedCount++;
        Sleep(50); // Small delay to avoid overwhelming the API
    }
    
    symbolMappingsJson += "]}}";
    
    string finalUpdate = "{\"fields\":{" + symbolMappingsg to your linked trading account.

Here are the required changes.
Json + "}}";
    string documentPath = "userSettings/" + userID;
    string url = baseURL + documentPath + "?updateMask.fieldPaths=symbolMappings&key=" + Firebase_API_Key;
    
    if(SendFirebaseRequest("PATCH", url, finalUpdate))
    {
        Print("✓ Symbol synchronization completed. Synced ", syncedCount, " symbols.");
    }
    else
    {
        Print("✗ Symbol synchronization failed.");
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
    string queryJson = "{\"structuredQuery\":{";
    queryJson += "\"from\":[{\"collectionId\":\"bots\"}],";
    queryJson += "\"where\":{\"compositeFilter\":{";
    queryJson += "\"op\":\"AND\",\"filters\":[";
    queryJson += "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"uid\"},\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"" + userID + "\"}}},";
    queryJson += "{\"fieldFilter\":{\"field\":{\"fieldPath\":\"status\"},\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"active\"}}}";
    queryJson += "]}}}}";
    
    if(SendFirebaseRequest("POST", queryUrl + "?key=" + Firebase_API_Key, queryJson))
    {
        Print("✓ Bot query sent successfully");
        // Note: In a real implementation, you would parse the response and process each bot
        // For now, this demonstrates the query structure
    }
    else
    {
        Print("✗ Bot query failed");
    }
}

//+------------------------------------------------------------------+
//| Execute bot trading strategy                                      |
//+------------------------------------------------------------------+
void ExecuteBotStrategy(string pair, double lotSize, string strategy)
{
    Print("Executing strategy: ", strategy, " for ", pair, " with lot size: ", lotSize);
    
    // Simple example strategy implementation
    if(strategy == "buy_and_hold")
    {
        // Check if we already have a position for this pair
        if(!PositionSelect(pair))
        {
            // No position exists, place a buy order
            double ask = SymbolInfoDouble(pair, SYMBOL_ASK);
            if(ask > 0)
            {
                if(trade.Buy(lotSize, pair, ask, 0, 0, "DalyDough Bot"))
                {
                    Print("✓ Executed BUY order for ", pair, " at ", ask);
                }
                else
                {
                    Print("✗ Failed to execute BUY order for ", pair);
                }
            }
        }
        else
        {
            Print("Position already exists for ", pair);
        }
    }
    else if(strategy == "sell_and_hold")
    {
        // Check if we already have a position for this pair
        if(!PositionSelect(pair))
        {
            // No position exists, place a sell order
            double bid = SymbolInfoDouble(pair, SYMBOL_BID);
            if(bid > 0)
            {
                if(trade.Sell(lotSize, pair, bid, 0, 0, "DalyDough Bot"))
                {
                    Print("✓ Executed SELL order for ", pair, " at ", bid);
                }
                else
                {
                    Print("✗ Failed to execute SELL order for ", pair);
                }
            }
        }
        else
        {
            Print("Position already exists for ", pair);
        }
    }
    // Add more strategies as needed
}

    