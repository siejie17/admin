export const setItem = async (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error("Error storing value:", error);
    }
};

export const getItem = async (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error("Error retrieving value:", error);
        return null;
    }
};

export const removeItem = async (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Error deleting value:", error);
    }
};
