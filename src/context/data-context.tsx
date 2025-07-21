
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

    setIsLoading(true);

    // 1. Setup listener for User Settings (contains symbol mappings)
    const settingsRef = doc(db, 'userSettings', user.uid);
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserSettings(docSnap.data() as UserSettings);
      } else {
         // If no settings exist, create a default structure but don't assume it's "loaded" for D-Score fetching yet
         // The main fetch logic will handle this case.
         setUserSettings({
            symbolMappings: [
                { brokerSymbol: 'EURUSD', apiSymbol: 'EUR/USD', description: 'Euro vs US Dollar' },
                { brokerSymbol: 'USDJPY', apiSymbol: 'USD/JPY', description: 'US Dollar vs Japanese Yen' },
                { brokerSymbol: 'GBPUSD', apiSymbol: 'GBP/USD', description: 'Great Britain Pound vs US Dollar' },
            ]
        });
      }
      setIsSettingsLoaded(true); // Mark settings as loaded/checked
    }, (error) => {
      console.error("Error fetching user settings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load user settings.' });
      setIsSettingsLoaded(true); // Still mark as loaded to prevent infinite loading state
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
      // **THE FIX**: Do not proceed if settings haven't been loaded from Firestore yet.
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
