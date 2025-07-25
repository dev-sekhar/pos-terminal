import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTenant } from './TenantContext';

const DEFAULT_BRANCHES = ['Main', 'Branch A'];

const BranchContext = createContext();

export function useBranch() {
  return useContext(BranchContext);
}

export function BranchProvider({ children }) {
  const { tenant } = useTenant();
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.branch && typeof user.branch === 'object') {
      return user.branch.name || user.branch.tag || '';
    }
    if (user.branch && typeof user.branch === 'string') {
      return user.branch;
    }
    return '';
  });
  const [branchLocked, setBranchLocked] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const saved = localStorage.getItem(`${tenant}_branchesData`);
    let branchList = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        branchList = parsed.filter(b => b.active && !b.deleted).map(b => b.tag);
      } catch {
        branchList = [];
      }
    }
    if (user.role && user.role.toUpperCase() === 'ADMIN') {
      setBranches(branchList);
      setBranch(branchList[0]);
      setBranchLocked(false);
    } else if (user.branch) {
      if (typeof user.branch === 'object') {
        setBranches([user.branch.name || user.branch.tag || '']);
        setBranch(user.branch.name || user.branch.tag || '');
      } else {
        setBranches([user.branch]);
        setBranch(user.branch);
      }
      setBranchLocked(true);
    } else {
      setBranches(branchList.length ? branchList : DEFAULT_BRANCHES);
      setBranch(branchList.length ? branchList[0] : DEFAULT_BRANCHES[0]);
      setBranchLocked(false);
    }
  }, [tenant]);

  useEffect(() => {
    localStorage.setItem('branch', branch);
  }, [branch]);

  useEffect(() => {
    if (branchLocked) {
      setBranches([branch]);
    }
  }, [branch, branchLocked]);

  return (
    <BranchContext.Provider value={{ branch, setBranch, branches, setBranches, branchLocked }}>
      {children}
    </BranchContext.Provider>
  );
} 