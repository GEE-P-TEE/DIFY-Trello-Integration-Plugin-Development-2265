import React, { createContext, useContext, useState, useEffect } from 'react';
import { trelloAPI } from '../services/trelloAPI';
import toast from 'react-hot-toast';

const TrelloContext = createContext();

export const useTrello = () => {
  const context = useContext(TrelloContext);
  if (!context) {
    throw new Error('useTrello must be used within a TrelloProvider');
  }
  return context;
};

export const TrelloProvider = ({ children }) => {
  const [credentials, setCredentials] = useState(() => {
    const stored = localStorage.getItem('trello_credentials');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [labels, setLabels] = useState([]);
  const [members, setMembers] = useState([]);
  const [cardHistory, setCardHistory] = useState(() => {
    const stored = localStorage.getItem('card_history');
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (credentials) {
      validateConnection();
    }
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('card_history', JSON.stringify(cardHistory));
  }, [cardHistory]);

  const validateConnection = async () => {
    if (!credentials) return;
    
    setLoading(true);
    try {
      const user = await trelloAPI.validateCredentials(credentials);
      setConnected(true);
      await loadBoards();
      toast.success(`Connected as ${user.fullName}`);
    } catch (error) {
      setConnected(false);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const setTrelloCredentials = (creds) => {
    setCredentials(creds);
    localStorage.setItem('trello_credentials', JSON.stringify(creds));
  };

  const loadBoards = async () => {
    if (!credentials) return;
    
    try {
      const boardsData = await trelloAPI.getBoards(credentials);
      setBoards(boardsData);
    } catch (error) {
      toast.error('Failed to load boards');
    }
  };

  const loadBoardData = async (boardId) => {
    if (!credentials || !boardId) return;
    
    setLoading(true);
    try {
      const [listsData, labelsData, membersData] = await Promise.all([
        trelloAPI.getLists(credentials, boardId),
        trelloAPI.getLabels(credentials, boardId),
        trelloAPI.getMembers(credentials, boardId)
      ]);
      
      setLists(listsData);
      setLabels(labelsData);
      setMembers(membersData);
      setSelectedBoard(boardId);
    } catch (error) {
      toast.error('Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (cardData) => {
    if (!credentials) {
      throw new Error('No credentials available');
    }
    
    try {
      const result = await trelloAPI.createCard(credentials, cardData);
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        ...cardData,
        cardId: result.id,
        cardUrl: result.url,
        createdAt: new Date().toISOString(),
        status: 'success'
      };
      
      setCardHistory(prev => [historyEntry, ...prev.slice(0, 99)]); // Keep last 100
      
      return result;
    } catch (error) {
      // Add failed attempt to history
      const historyEntry = {
        id: Date.now(),
        ...cardData,
        createdAt: new Date().toISOString(),
        status: 'failed',
        error: error.message
      };
      
      setCardHistory(prev => [historyEntry, ...prev.slice(0, 99)]);
      throw error;
    }
  };

  const clearHistory = () => {
    setCardHistory([]);
    localStorage.removeItem('card_history');
    toast.success('History cleared');
  };

  const disconnect = () => {
    setCredentials(null);
    setConnected(false);
    setBoards([]);
    setLists([]);
    setLabels([]);
    setMembers([]);
    setSelectedBoard(null);
    localStorage.removeItem('trello_credentials');
    toast.success('Disconnected from Trello');
  };

  const value = {
    credentials,
    setTrelloCredentials,
    boards,
    selectedBoard,
    lists,
    labels,
    members,
    cardHistory,
    loading,
    connected,
    validateConnection,
    loadBoards,
    loadBoardData,
    createCard,
    clearHistory,
    disconnect
  };

  return (
    <TrelloContext.Provider value={value}>
      {children}
    </TrelloContext.Provider>
  );
};