const Storage = {
    // get stuff from local storage or return default
    get(key, initial) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initial;
        } catch (e) {
            console.error('storage read error', e);
            return initial;
        }
    },

    // save data to local storage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('storage write error', e);
        }
    },

    clear() {
        localStorage.clear();
    }
};
