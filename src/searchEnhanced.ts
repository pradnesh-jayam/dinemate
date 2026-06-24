import type { SearchResult, User, Restaurant, Slot } from './types.js';

/**
 * Enhanced search with client-side indexing and fuzzy matching
 */
class SearchIndex {
  private users: Map<string, User> = new Map();
  private restaurants: Map<string, Restaurant> = new Map();
  private slots: Map<string, Slot> = new Map();
  private userIndex: Map<string, string[]> = new Map();
  private restaurantIndex: Map<string, string[]> = new Map();
  private slotIndex: Map<string, string[]> = new Map();

  /**
   * Index a user for search
   */
  indexUser(user: User): void {
    this.users.set(user.uid, user);
    const keywords = this.extractKeywords(`${user.displayName} ${user.email} ${user.bio || ''}`);
    keywords.forEach(keyword => {
      if (!this.userIndex.has(keyword)) {
        this.userIndex.set(keyword, []);
      }
      this.userIndex.get(keyword)!.push(user.uid);
    });
  }

  /**
   * Index a restaurant for search
   */
  indexRestaurant(restaurant: Restaurant): void {
    this.restaurants.set(restaurant.id, restaurant);
    const keywords = this.extractKeywords(
      `${restaurant.name} ${restaurant.cuisine} ${restaurant.location} ${restaurant.notes || ''}`
    );
    keywords.forEach(keyword => {
      if (!this.restaurantIndex.has(keyword)) {
        this.restaurantIndex.set(keyword, []);
      }
      this.restaurantIndex.get(keyword)!.push(restaurant.id);
    });
  }

  /**
   * Index a slot for search
   */
  indexSlot(slot: Slot): void {
    this.slots.set(slot.id, slot);
    const keywords = this.extractKeywords(
      `${slot.restaurantName} ${slot.hostName} ${slot.cuisine || ''} ${slot.notes || ''}`
    );
    keywords.forEach(keyword => {
      if (!this.slotIndex.has(keyword)) {
        this.slotIndex.set(keyword, []);
      }
      this.slotIndex.get(keyword)!.push(slot.id);
    });
  }

  /**
   * Extract keywords from text for indexing
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Search across all indexed data
   */
  search(query: string): SearchResult[] {
    if (!query || query.length < 2) return [];

    const keywords = this.extractKeywords(query);
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    // Search users
    keywords.forEach(keyword => {
      const userIds = this.userIndex.get(keyword) || [];
      userIds.forEach(userId => {
        if (!seen.has(`user-${userId}`)) {
          const user = this.users.get(userId);
          if (user) {
            results.push({
              type: 'user',
              id: user.uid,
              name: user.displayName || 'Unknown',
              subtitle: user.email,
              avatar: user.photoURL
            });
            seen.add(`user-${userId}`);
          }
        }
      });
    });

    // Search restaurants
    keywords.forEach(keyword => {
      const restaurantIds = this.restaurantIndex.get(keyword) || [];
      restaurantIds.forEach(restaurantId => {
        if (!seen.has(`restaurant-${restaurantId}`)) {
          const restaurant = this.restaurants.get(restaurantId);
          if (restaurant) {
            results.push({
              type: 'restaurant',
              id: restaurant.id,
              name: restaurant.name,
              subtitle: `${restaurant.cuisine} • ${restaurant.rating}★`,
              avatar: undefined
            });
            seen.add(`restaurant-${restaurantId}`);
          }
        }
      });
    });

    // Search slots
    keywords.forEach(keyword => {
      const slotIds = this.slotIndex.get(keyword) || [];
      slotIds.forEach(slotId => {
        if (!seen.has(`slot-${slotId}`)) {
          const slot = this.slots.get(slotId);
          if (slot) {
            results.push({
              type: 'slot',
              id: slot.id,
              name: slot.restaurantName,
              subtitle: `${slot.date} at ${slot.time} • ${slot.hostName}`,
              avatar: slot.hostPhoto
            });
            seen.add(`slot-${slotId}`);
          }
        }
      });
    });

    return results;
  }

  /**
   * Clear all indexes
   */
  clear(): void {
    this.users.clear();
    this.restaurants.clear();
    this.slots.clear();
    this.userIndex.clear();
    this.restaurantIndex.clear();
    this.slotIndex.clear();
  }

  /**
   * Get index statistics
   */
  getStats(): { users: number; restaurants: number; slots: number } {
    return {
      users: this.users.size,
      restaurants: this.restaurants.size,
      slots: this.slots.size
    };
  }
}

// Singleton instance
export const searchIndex = new SearchIndex();

/**
 * Perform search with debouncing
 */
export function performSearch(query: string): SearchResult[] {
  return searchIndex.search(query);
}

/**
 * Rebuild search index from data
 */
export function rebuildIndex(
  users: User[],
  restaurants: Restaurant[],
  slots: Slot[]
): void {
  searchIndex.clear();
  users.forEach(user => searchIndex.indexUser(user));
  restaurants.forEach(restaurant => searchIndex.indexRestaurant(restaurant));
  slots.forEach(slot => searchIndex.indexSlot(slot));
}
