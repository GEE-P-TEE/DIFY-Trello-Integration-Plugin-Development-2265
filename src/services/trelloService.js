import { trelloAPI } from './trelloAPI';
import { trelloProxyAPI } from './trelloProxy';

// Service that tries different methods to connect to Trello API
class TrelloService {
  constructor() {
    this.primaryAPI = trelloAPI;
    this.fallbackAPI = trelloProxyAPI;
    this.currentAPI = this.primaryAPI;
  }

  async validateCredentials(credentials) {
    try {
      // Try primary API first (JSONP)
      return await this.primaryAPI.validateCredentials(credentials);
    } catch (error) {
      console.warn('Primary API failed, trying fallback:', error.message);
      try {
        // Try fallback API (proxy)
        this.currentAPI = this.fallbackAPI;
        return await this.fallbackAPI.validateCredentials(credentials);
      } catch (fallbackError) {
        console.error('Both APIs failed:', fallbackError.message);
        throw new Error('Unable to connect to Trello API. Please check your credentials and network connection.');
      }
    }
  }

  async getBoards(credentials) {
    try {
      return await this.currentAPI.getBoards(credentials);
    } catch (error) {
      // Try the other API if current one fails
      const otherAPI = this.currentAPI === this.primaryAPI ? this.fallbackAPI : this.primaryAPI;
      try {
        this.currentAPI = otherAPI;
        return await otherAPI.getBoards(credentials);
      } catch (fallbackError) {
        throw new Error('Failed to fetch boards from Trello');
      }
    }
  }

  async getLists(credentials, boardId) {
    try {
      return await this.currentAPI.getLists(credentials, boardId);
    } catch (error) {
      const otherAPI = this.currentAPI === this.primaryAPI ? this.fallbackAPI : this.primaryAPI;
      try {
        this.currentAPI = otherAPI;
        return await otherAPI.getLists(credentials, boardId);
      } catch (fallbackError) {
        throw new Error('Failed to fetch lists from Trello');
      }
    }
  }

  async getLabels(credentials, boardId) {
    try {
      return await this.currentAPI.getLabels(credentials, boardId);
    } catch (error) {
      const otherAPI = this.currentAPI === this.primaryAPI ? this.fallbackAPI : this.primaryAPI;
      try {
        this.currentAPI = otherAPI;
        return await otherAPI.getLabels(credentials, boardId);
      } catch (fallbackError) {
        throw new Error('Failed to fetch labels from Trello');
      }
    }
  }

  async getMembers(credentials, boardId) {
    try {
      return await this.currentAPI.getMembers(credentials, boardId);
    } catch (error) {
      const otherAPI = this.currentAPI === this.primaryAPI ? this.fallbackAPI : this.primaryAPI;
      try {
        this.currentAPI = otherAPI;
        return await otherAPI.getMembers(credentials, boardId);
      } catch (fallbackError) {
        throw new Error('Failed to fetch members from Trello');
      }
    }
  }

  async createCard(credentials, cardData) {
    // Card creation is more complex and requires proper backend
    try {
      return await this.primaryAPI.createCard(credentials, cardData);
    } catch (error) {
      throw new Error('Card creation failed. For reliable card creation, please set up the Supabase backend integration.');
    }
  }
}

export const trelloService = new TrelloService();