
'use client';

import * as React from 'react';
import type { DScore, Bot, AutoBotStrategy, UserSettings } from '@/lib/types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';
import { botConfigurationData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// Hardcoded list of 38 symbols as a temporary fix.
const hardcodedSymbolMappings = [
    { brokerSymbol: 'EURUSD', apiSymbol: 'EUR/USD', description: 'Euro vs US Dollar' },
    { brokerSymbol: 'USDJPY', apiSymbol: 'USD/JPY', description: 'US Dollar vs Japanese Yen' },
    { brokerSymbol: 'GBPUSD', apiSymbol: 'GBP/USD', description: 'Great Britain Pound vs US Dollar' },
    { brokerSymbol: 'USDCHF', apiSymbol: 'USD/CHF', description: 'US Dollar vs Swiss Franc' },
    { brokerSymbol: 'AUDUSD', apiSymbol: 'AUD/USD', description: 'Australian Dollar vs US Dollar' },
    { brokerSymbol: 'USDCAD', apiSymbol: 'USD/CAD', description: 'US Dollar vs Canadian Dollar' },
    { brokerSymbol: 'NZDUSD', apiSymbol: 'NZD/USD', description: 'New Zealand Dollar vs US Dollar' },
    { brokerSymbol: 'EURGBP', apiSymbol: 'EUR/GBP', description: 'Euro vs Great Britain Pound' },
    { brokerSymbol: 'EURAUD', apiSymbol: 'EUR/AUD', description: 'Euro vs Australian Dollar' },
    { brokerSymbol: 'EURJPY', apiSymbol: 'EUR/JPY', description: 'Euro vs Japanese Yen' },
    { brokerSymbol: 'EURCHF', apiSymbol: 'EUR/CHF', description: 'Euro vs Swiss Franc' },
    { brokerSymbol: 'GBPJPY', apiSymbol: 'GBP/JPY', description: 'Great Britain Pound vs Japanese Yen' },
    { brokerSymbol: 'GBPCHF', apiSymbol: 'GBP/CHF', description: 'Great Britain Pound vs Swiss Franc' },
    { brokerSymbol: 'GBPAUD', apiSymbol: 'GBP/AUD', description: 'Great Britain Pound vs Australian Dollar' },
    { brokerSymbol: 'AUDJPY', apiSymbol: 'AUD/JPY', description: 'Australian Dollar vs Japanese Yen' },
    { brokerSymbol: 'NZDJPY', apiSymbol: 'NZD/JPY', description: 'New Zealand Dollar vs Japanese Yen' },
    { brokerSymbol: 'CADJPY', apiSymbol: 'CAD/JPY', description: 'Canadian Dollar vs Japanese Yen' },
    { brokerSymbol: 'CHFJPY', apiSymbol: 'CHF/JPY', description: 'Swiss Franc vs Japanese Yen' },
    { brokerSymbol: 'AUDCAD', apiSymbol: 'AUD/CAD', description: 'Australian Dollar vs Canadian Dollar' },
    { brokerSymbol: 'AUDNZD', apiSymbol: 'AUD/NZD', description: 'Australian Dollar vs New Zealand Dollar' },
    { brokerSymbol: 'EURCAD', apiSymbol: 'EUR/CAD', description: 'Euro vs Canadian Dollar' },
    { brokerSymbol: 'EURNZD', apiSymbol: 'EUR/NZD', description: 'Euro vs New Zealand Dollar' },
    { brokerSymbol: 'GBPCAD', apiSymbol: 'GBP/CAD', description: 'Great Britain Pound vs Canadian Dollar' },
    { brokerSymbol: 'GBPNZD', apiSymbol: 'GBP/NZD', description: 'Great Britain Pound vs New Zealand Dollar' },
    { brokerSymbol: 'XAUUSD', apiSymbol: 'XAU/USD', description: 'Gold vs US Dollar' },
    { brokerSymbol: 'XAGUSD', apiSymbol: 'XAG/USD', description: 'Silver vs US Dollar' },
    { brokerSymbol: 'WTICOUSD', apiSymbol: 'WTI/USD', description: 'WTI Crude Oil vs US Dollar' },
    { brokerSymbol: 'USDNOK', apiSymbol: 'USD/NOK', description: 'US Dollar vs Norwegian Krone' },
    { brokerSymbol: 'USDSEK', apiSymbol: 'USD/SEK', description: 'US Dollar vs Swedish Krona' },
    { brokerSymbol: 'USDZAR', apiSymbol: 'USD/ZAR', description: 'US Dollar vs South African Rand' },
    { brokerSymbol: 'USDTRY', apiSymbol: 'USD/TRY', description: 'US Dollar vs Turkish Lira' },
    { brokerSymbol: 'USDMXN', apiSymbol: 'USD/MXN', description: 'US Dollar vs Mexican Peso' },
    { brokerSymbol: 'USDSGD', apiSymbol: 'USD/SGD', description: 'US Dollar vs Singapore Dollar' },
    { brokerSymbol: 'USDHKD', apiSymbol: 'USD/HKD', description: 'US Dollar vs Hong Kong Dollar' },
    { brokerSymbol: 'EURNOK', apiSymbol: 'EUR/NOK', description: 'Euro vs Norwegian Krone' },
    { brokerSymbol: 'EURSEK', apiSymbol: 'EUR/SEK', description: 'Euro vs Swedish Krona' },
    { brokerSymbol: 'BTCUSD', apiSymbol: 'BTC/USD', description: 'Bitcoin vs US Dollar' },
    { brokerSymbol: 'ETHUSD', apiSymbol: 'ETH/USD', description: 'Ethereum vs US Dollar' },
];


interface DataContextType {
  isLoading: boolean;
  dScoreData: DScore[];
  allBots: Bot[];
  activeBots: Bot[];
  closedBots: Bot[];
  strategy: AutoBotStrategy | null;
  userSettings: UserSettings | null;
  triggerRefresh: () => void;
  lastUpdated: Date;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [dScoreData, setDScoreData] = React.useState<DScore[]>([]);
  const [allBots, setAllBots] = React.useState<Bot[]>([]);
  const [strategy, setStrategy] = React.useState<AutoBotStrategy | null>(null);
  
  // Use the hardcoded list directly
  const [userSettings] = React.useState<UserSettings>({ symbolMappings: hardcodedSymbolMappings });

  const [refreshKey, setRefreshKey] = React.useState(0);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  React.useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setDScoreData([]);
      setAllBots([]);
      setStrategy(null);
      return;
    }

    setIsLoading(true);

    const botsQuery = query(collection(db, "bots"), where("uid", "==", user.uid));
    const unsubscribeBots = onSnapshot(botsQuery, (snapshot) => {
      const bots: Bot[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        bots.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null,
        } as Bot);
      });
      setAllBots(bots);
    }, (error) => {
      console.error("Error fetching bots:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load bot data.' });
    });

    const strategyRef = doc(db, 'autobotStrategies', user.uid);
    const unsubscribeStrategy = onSnapshot(strategyRef, (docSnap) => {
        if (docSnap.exists()) {
            setStrategy({ id: docSnap.id, ...docSnap.data() } as AutoBotStrategy);
        } else {
             setStrategy({ 
                id: user.uid, 
                ...botConfigurationData, 
                includedPairs: {},
                entryThresholdLower: -7,
                entryThresholdUpper: 7,
                exitThresholdLower: -6,
                exitThresholdUpper: 6
            });
        }
    }, (error) => {
      console.error("Error fetching autobot strategy:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load AutoBot strategy.' });
    });

    return () => {
      unsubscribeBots();
      unsubscribeStrategy();
    };
  }, [user, toast]);


  React.useEffect(() => {
    const fetchDScoreData = async () => {
      if (!userSettings || !userSettings.symbolMappings || userSettings.symbolMappings.length === 0) {
        setDScoreData([]);
        setLastUpdated(new Date());
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const pairs = userSettings.symbolMappings.map(m => m.apiSymbol);
      try {
        const data = await Promise.all(
          pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
        );
        setDScoreData(data.filter(Boolean));
      } catch (error) {
        console.error("Error fetching D-Score data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch market data.' });
      } finally {
        setLastUpdated(new Date());
        setIsLoading(false);
      }
    };

    fetchDScoreData();
  }, [userSettings, refreshKey, toast]);


  const activeBots = React.useMemo(() => allBots.filter(b => b.status !== 'closed'), [allBots]);
  const closedBots = React.useMemo(() => allBots.filter(b => b.status === 'closed'), [allBots]);
  
  const value = {
    isLoading,
    dScoreData,
    allBots,
    activeBots,
    closedBots,
    strategy,
    userSettings,
    triggerRefresh,
    lastUpdated
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
