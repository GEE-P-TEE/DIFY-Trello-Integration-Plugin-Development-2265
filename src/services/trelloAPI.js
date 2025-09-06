import axios from 'axios';

const BASE_URL = 'https://api.trello.com/1';

// Create a CORS proxy service
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

class TrelloAPI {
  constructor() {
    // Configure axios defaults
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  createAuthParams(credentials) {
    return {
      key: credentials.apiKey,
      token: credentials.token
    };
  }

  // Use JSONP for browser compatibility
  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    // Add JSONP callback
    url.searchParams.append('callback', 'JSONP_CALLBACK');
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const callbackName = `trello_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up callback
      window[callbackName] = (data) => {
        document.head.removeChild(script);
        delete window[callbackName];
        resolve(data);
      };
      
      // Replace callback parameter
      url.searchParams.set('callback', callbackName);
      
      script.src = url.toString();
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        reject(new Error('Network error'));
      };
      
      document.head.appendChild(script);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (window[callbackName]) {
          document.head.removeChild(script);
          delete window[callbackName];
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async validateCredentials(credentials) {
    try {
      const params = this.createAuthParams(credentials);
      const data = await this.makeRequest('/members/me', params);
      
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
      const params = {
        ...this.createAuthParams(credentials),
        filter: 'open',
        fields: 'id,name,desc,url,prefs'
      };
      
      const data = await this.makeRequest('/members/me/boards', params);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      throw new Error('Failed to fetch boards');
    }
  }

  async getLists(credentials, boardId) {
    try {
      const params = {
        ...this.createAuthParams(credentials),
        filter: 'open',
        fields: 'id,name,pos'
      };
      
      const data = await this.makeRequest(`/boards/${boardId}/lists`, params);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch lists:', error);
      throw new Error('Failed to fetch lists');
    }
  }

  async getLabels(credentials, boardId) {
    try {
      const params = this.createAuthParams(credentials);
      const data = await this.makeRequest(`/boards/${boardId}/labels`, params);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      throw new Error('Failed to fetch labels');
    }
  }

  async getMembers(credentials, boardId) {
    try {
      const params = {
        ...this.createAuthParams(credentials),
        fields: 'id,fullName,username,avatarUrl'
      };
      
      const data = await this.makeRequest(`/boards/${boardId}/members`, params);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch members:', error);
      throw new Error('Failed to fetch members');
    }
  }

  async createCard(credentials, cardData) {
    try {
      // For POST requests, we need to use a different approach
      // We'll use a form submission technique
      const params = {
        ...this.createAuthParams(credentials),
        idList: cardData.listId,
        name: cardData.title.substring(0, 512),
        desc: cardData.description.substring(0, 16384)
      };

      if (cardData.dueDate) {
        params.due = cardData.dueDate;
      }

      if (cardData.assigneeId) {
        params.idMembers = cardData.assigneeId;
      }

      // Create a hidden form to submit the POST request
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${BASE_URL}/cards`;
      form.style.display = 'none';
      form.target = 'trello_iframe';

      // Add parameters as hidden inputs
      Object.keys(params).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      });

      // Create iframe to handle response
      const iframe = document.createElement('iframe');
      iframe.name = 'trello_iframe';
      iframe.style.display = 'none';
      
      document.body.appendChild(form);
      document.body.appendChild(iframe);

      return new Promise((resolve, reject) => {
        iframe.onload = async () => {
          try {
            // Try to get the response from iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const responseText = iframeDoc.body.textContent;
            
            // Clean up
            document.body.removeChild(form);
            document.body.removeChild(iframe);
            
            if (responseText) {
              try {
                const card = JSON.parse(responseText);
                
                // Add labels if specified
                if (cardData.labelIds && cardData.labelIds.length > 0) {
                  await this.addLabelsToCard(credentials, card.id, cardData.labelIds);
                }
                
                resolve(card);
              } catch (parseError) {
                reject(new Error('Failed to parse response'));
              }
            } else {
              reject(new Error('No response received'));
            }
          } catch (error) {
            document.body.removeChild(form);
            document.body.removeChild(iframe);
            reject(error);
          }
        };

        iframe.onerror = () => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
          reject(new Error('Failed to create card'));
        };

        form.submit();

        // Timeout after 30 seconds
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form);
            document.body.removeChild(iframe);
            reject(new Error('Request timeout'));
          }
        }, 30000);
      });

    } catch (error) {
      console.error('Failed to create card:', error);
      if (error.message?.includes('429')) {
        throw new Error('Rate limited. Please try again in a moment.');
      }
      throw new Error(error.message || 'Failed to create card');
    }
  }

  async addLabelsToCard(credentials, cardId, labelIds) {
    try {
      for (const labelId of labelIds) {
        const params = {
          ...this.createAuthParams(credentials),
          value: labelId
        };
        
        // Use similar form submission for adding labels
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${BASE_URL}/cards/${cardId}/idLabels`;
        form.style.display = 'none';

        Object.keys(params).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = params[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.warn('Failed to add some labels:', error);
    }
  }
}

export const trelloAPI = new TrelloAPI();