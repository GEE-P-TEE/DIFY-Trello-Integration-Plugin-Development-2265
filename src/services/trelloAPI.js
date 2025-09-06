import axios from 'axios';

const BASE_URL = 'https://api.trello.com/1';

class TrelloAPI {
  createAuthParams(credentials) {
    return {
      key: credentials.apiKey,
      token: credentials.token
    };
  }

  async validateCredentials(credentials) {
    try {
      const response = await axios.get(`${BASE_URL}/members/me`, {
        params: this.createAuthParams(credentials),
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      throw new Error('Invalid API credentials');
    }
  }

  async getBoards(credentials) {
    try {
      const response = await axios.get(`${BASE_URL}/members/me/boards`, {
        params: {
          ...this.createAuthParams(credentials),
          filter: 'open',
          fields: 'id,name,desc,url,prefs'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch boards');
    }
  }

  async getLists(credentials, boardId) {
    try {
      const response = await axios.get(`${BASE_URL}/boards/${boardId}/lists`, {
        params: {
          ...this.createAuthParams(credentials),
          filter: 'open',
          fields: 'id,name,pos'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch lists');
    }
  }

  async getLabels(credentials, boardId) {
    try {
      const response = await axios.get(`${BASE_URL}/boards/${boardId}/labels`, {
        params: this.createAuthParams(credentials)
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch labels');
    }
  }

  async getMembers(credentials, boardId) {
    try {
      const response = await axios.get(`${BASE_URL}/boards/${boardId}/members`, {
        params: {
          ...this.createAuthParams(credentials),
          fields: 'id,fullName,username,avatarUrl'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch members');
    }
  }

  async createCard(credentials, cardData) {
    try {
      const params = {
        ...this.createAuthParams(credentials),
        idList: cardData.listId,
        name: cardData.title,
        desc: cardData.description
      };

      if (cardData.dueDate) {
        params.due = cardData.dueDate;
      }

      if (cardData.assigneeId) {
        params.idMembers = cardData.assigneeId;
      }

      const response = await axios.post(`${BASE_URL}/cards`, null, {
        params,
        timeout: 30000
      });

      const card = response.data;

      // Add labels if specified
      if (cardData.labelIds && cardData.labelIds.length > 0) {
        await this.addLabelsToCard(credentials, card.id, cardData.labelIds);
      }

      return card;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited. Please try again in a moment.');
      }
      throw new Error(error.response?.data?.message || 'Failed to create card');
    }
  }

  async addLabelsToCard(credentials, cardId, labelIds) {
    try {
      for (const labelId of labelIds) {
        await axios.post(`${BASE_URL}/cards/${cardId}/idLabels`, null, {
          params: {
            ...this.createAuthParams(credentials),
            value: labelId
          }
        });
      }
    } catch (error) {
      console.warn('Failed to add some labels:', error);
    }
  }

  async getCard(credentials, cardId) {
    try {
      const response = await axios.get(`${BASE_URL}/cards/${cardId}`, {
        params: this.createAuthParams(credentials)
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch card');
    }
  }
}

export const trelloAPI = new TrelloAPI();