import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_BRANCHES = ['Main', 'Branch A'];

const BranchContext = createContext();

export const useBranch = () => useContext(BranchContext);

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('branchesData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only return active and not deleted branches, fallback to tags
        return parsed.filter(b => b.active && !b.deleted).map(b => b.tag);
      } catch {
        return DEFAULT_BRANCHES;
      }
    }
    return DEFAULT_BRANCHES;
  });
  const [branch, setBranch] = useState(branches[0]);

  // Update branches if localStorage changes
  useEffect(() => {
    const saved = localStorage.getItem('branchesData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBranches(parsed.filter(b => b.active && !b.deleted).map(b => b.tag));
      } catch {}
    }
  }, []);

  return (
    <BranchContext.Provider value={{ branch, setBranch, branches, setBranches }}>
      {children}
    </BranchContext.Provider>
  );
}; 