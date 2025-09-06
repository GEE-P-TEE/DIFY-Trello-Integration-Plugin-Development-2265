// Alternative implementation using a proxy server
class TrelloProxyAPI {
  constructor() {
    this.proxyURL = 'https://api.allorigins.win/raw?url=';
  }

  encodeURL(url) {
    return encodeURIComponent(url);
  }

  async makeProxiedRequest(url, options = {}) {
    const proxiedURL = `${this.proxyURL}${this.encodeURL(url)}`;
    
    try {
      const response = await fetch(proxiedURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Proxy request failed:', error);
      throw error;
    }
  }

  createAuthParams(credentials) {
    return new URLSearchParams({
      key: credentials.apiKey,
      token: credentials.token
    });
  }

  async validateCredentials(credentials) {
    try {
      const params = this.createAuthParams(credentials);
      const url = `https://api.trello.com/1/members/me?${params.toString()}`;
      
      const data = await this.makeProxiedRequest(url);
      
      if (!data || !data.id) {
        throw new Error('Invalid API response');
      }
      
      return data;
    } catch (error) {
      console.error('Credential validation error:', error);
      throw new Error('Invalid API credentials');
    }
  }

  async getBoards(credentials) {
    try {
      const params = this.createAuthParams(credentials);
      params.append('filter', 'open');
      params.append('fields', 'id,name,desc,url,prefs');
      
      const url = `https://api.trello.com/1/members/me/boards?${params.toString()}`;
      const data = await this.makeProxiedRequest(url);
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      throw new Error('Failed to fetch boards');
    }
  }

  async getLists(credentials, boardId) {
    try {
      const params = this.createAuthParams(credentials);
      params.append('filter', 'open');
      params.append('fields', 'id,name,pos');
      
      const url = `https://api.trello.com/1/boards/${boardId}/lists?${params.toString()}`;
      const data = await this.makeProxiedRequest(url);
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch lists:', error);
      throw new Error('Failed to fetch lists');
    }
  }

  async getLabels(credentials, boardId) {
    try {
      const params = this.createAuthParams(credentials);
      const url = `https://api.trello.com/1/boards/${boardId}/labels?${params.toString()}`;
      
      const data = await this.makeProxiedRequest(url);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      throw new Error('Failed to fetch labels');
    }
  }

  async getMembers(credentials, boardId) {
    try {
      const params = this.createAuthParams(credentials);
      params.append('fields', 'id,fullName,username,avatarUrl');
      
      const url = `https://api.trello.com/1/boards/${boardId}/members?${params.toString()}`;
      const data = await this.makeProxiedRequest(url);
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch members:', error);
      throw new Error('Failed to fetch members');
    }
  }

  async createCard(credentials, cardData) {
    // For creating cards, we still need to use the original API
    // This is a limitation of proxy services for POST requests
    throw new Error('Card creation requires a backend service. Please set up Supabase integration.');
  }
}

export const trelloProxyAPI = new TrelloProxyAPI();