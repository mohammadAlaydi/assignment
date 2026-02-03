const Storage = {
  // Get parsed data or default
  get(key, initial) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch (e) {
      console.error('Storage read error', e);
      return initial;
    }
  },

  // Save data
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  },

  clear() {
    localStorage.clear();
  }
};
