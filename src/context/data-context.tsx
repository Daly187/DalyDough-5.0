
'use client';

import * as React from 'react';
import type { DScore, Bot, AutoBotStrategy, UserSettings } from '@/lib/types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, onSnapshot, query, where, setDoc } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';
import { useToast } from '@/hooks/use-toast';

const defaultSymbolMappings = [
    { brokerSymbol: 'AUDCAD', apiSymbol: 'AUD/CAD', description: 'Australian Dollar vs Canadian Dollar' },
    { brokerSymbol: 'AUDCHF', apiSymbol: 'AUD/CHF', description: 'Australian Dollar vs Swiss Franc' },
    { brokerSymbol: 'AUDJPY', apiSymbol: 'AUD/JPY', description: 'Australian Dollar vs Japanese Yen' },
    { brokerSymbol: 'AUDNZD', apiSymbol: 'AUD/NZD', description: 'Australian Dollar vs New Zealand Dollar' },
    { brokerSymbol: 'AUDUSD', apiSymbol: 'AUD/USD', description: 'Australian Dollar vs US Dollar' },
    { brokerSymbol: 'CADJPY', apiSymbol: 'CAD/JPY', description: 'Canadian Dollar vs Japanese Yen' },
    { brokerSymbol: 'CHFJPY', apiSymbol: 'CHF/JPY', description: 'Swiss Franc vs Japanese Yen' },
    { brokerSymbol: 'EURCAD', apiSymbol: 'EUR/CAD', description: 'Euro vs Canadian Dollar' },
    { brokerSymbol: 'EURCHF', apiSymbol: 'EUR/CHF', description: 'Euro vs Swiss Franc' },
    { brokerSymbol: 'EURGBP', apiSymbol: 'EUR/GBP', description: 'Euro vs Great Britain Pound' },
    { brokerSymbol: 'EURJPY', apiSymbol: 'EUR/JPY', description: 'Euro vs Japanese Yen' },
    { brokerSymbol: 'EURNZD', apiSymbol: 'EUR/NZD', description: 'Euro vs New Zealand Dollar' },
    { brokerSymbol: 'EURTRY', apiSymbol: 'EUR/TRY', description: 'Euro vs Turkish Lira' },
    { brokerSymbol: 'EURUSD', apiSymbol: 'EUR/USD', description: 'Euro vs US Dollar' },
    { brokerSymbol: 'GBPAUD', apiSymbol: 'GBP/AUD', description: 'Great Britain Pound vs Australian Dollar' },
    { brokerSymbol: 'GBPCAD', apiSymbol: 'GBP/CAD', description: 'Great Britain Pound vs Canadian Dollar' },
    { brokerSymbol: 'GBPCHF', apiSymbol: 'GBP/CHF', description: 'Great Britain Pound vs Swiss Franc' },
    { brokerSymbol: 'GBPJPY', apiSymbol: 'GBP/JPY', description: 'Great Britain Pound vs Japanese Yen' },
    { brokerSymbol: 'GBPUSD', apiSymbol: 'GBP/USD', description: 'Great Britain Pound vs US Dollar' },
    { brokerSymbol: 'NZDCAD', apiSymbol: 'NZD/CAD', description: 'New Zealand Dollar vs Canadian Dollar' },
    { brokerSymbol: 'NZDCHF', apiSymbol: 'NZD/CHF', description: 'New Zealand Dollar vs Swiss Franc' },
    { brokerSymbol: 'NZDJPY', apiSymbol: 'NZD/JPY', description: 'New Zealand Dollar vs Japanese Yen' },
    { brokerSymbol: 'NZDUSD', apiSymbol: 'NZD/USD', description: 'New Zealand Dollar vs US Dollar' },
    { brokerSymbol: 'USDCAD', apiSymbol: 'USD/CAD', description: 'US Dollar vs Canadian Dollar' },
    { brokerSymbol: 'USDCHF', apiSymbol: 'USD/CHF', description: 'US Dollar vs Swiss Franc' },
    { brokerSymbol: 'USDJPY', apiSymbol: 'USD/JPY', description: 'US Dollar vs Japanese Yen' },
    { brokerSymbol: 'USDTRY', apiSymbol: 'USD/TRY', description: 'US Dollar vs Turkish Lira' },
    { brokerSymbol: 'USDZAR', apiSymbol: 'USD/ZAR', description: 'US Dollar vs South African Rand' },
    { brokerSymbol: 'XAUUSD', apiSymbol: 'XAU/USD', description: 'Gold vs US Dollar' },
];

const defaultStrategyData = {
    botType: 'Dynamic DCA',
    lotSize: 0.01,
    maxPositions: 5,
    reentryDelay: 15,
    stopLoss: 500,
    takeProfit: 100,
    enableDSizeExit: true,
    dSizeExitThreshold: 6.0,
    enableTrailingStop: false,
    trailingStopPips: 20,
    newsFilter: true,
    weekendTrading: false,
    aiOptimization: true,
    gridLevels: 5,
    gridDistance: 20,
    lotSizeMultiplier: 1.5,
    takeProfitType: 'fixed' as 'fixed' | 'average',
    closeOnRetrace: false,
    retracePercentage: 50,
};

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
  const [userSettings, setUserSettings] = React.useState<UserSettings | null>(null);
  const [isSettingsLoaded, setIsSettingsLoaded] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  React.useEffect(() => {
    if (!user) {
      setIsLoading(false);
      // Clear data on logout
      setDScoreData([]);
      setAllBots([]);
      setStrategy(null);
      setUserSettings(null);
      setIsSettingsLoaded(false);
      return;
    }

    // 1. Setup listener for User Settings (contains symbol mappings)
    const settingsRef = doc(db, 'userSettings', user.uid);
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserSettings(docSnap.data() as UserSettings);
      } else {
         const defaultSettings = { symbolMappings: defaultSymbolMappings };
         setDoc(settingsRef, defaultSettings); // Create default settings for new user
         setUserSettings(defaultSettings);
      }
      setIsSettingsLoaded(true);
    }, (error) => {
      console.error("Error fetching user settings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load user settings.' });
      setIsSettingsLoaded(true);
    });

    // 2. Setup listener for Bots
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

    // 3. Setup listener for Autobot Strategy
    const strategyRef = doc(db, 'autobotStrategies', user.uid);
    const unsubscribeStrategy = onSnapshot(strategyRef, (docSnap) => {
        if (docSnap.exists()) {
            setStrategy({ id: docSnap.id, ...docSnap.data() } as AutoBotStrategy);
        } else {
             setStrategy({ 
                id: user.uid, 
                ...defaultStrategyData, 
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


    // Cleanup listeners on unmount
    return () => {
      unsubscribeSettings();
      unsubscribeBots();
      unsubscribeStrategy();
    };
  }, [user, toast]);


  React.useEffect(() => {
    // 4. Fetch D-Score data ONLY when settings are confirmed loaded.
    const fetchDScoreData = async () => {
      if (!isSettingsLoaded) {
        return;
      }
      
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
  }, [userSettings, isSettingsLoaded, refreshKey, toast]);


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
