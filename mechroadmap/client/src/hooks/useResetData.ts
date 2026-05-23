// Hook to reset all localStorage data

export function useResetAllData() {
  const resetAll = () => {
    // Collect all keys first to avoid mutation during iteration
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear IndexedDB databases if present
    if (window.indexedDB) {
      indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) indexedDB.deleteDatabase(db.name);
        });
      });
    }

    window.location.reload();
  };

  return { resetAll };
}

// Reset data for a specific goal only
export function resetGoalData(goalId: string) {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(goalId)) keysToRemove.push(key);
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
