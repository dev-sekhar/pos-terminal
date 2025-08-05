import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useUser } from "./UserContext";
import { authenticatedFetch } from "../utils/api";

const BranchContext = createContext();
export const useBranch = () => useContext(BranchContext);

export const BranchProvider = ({ children }) => {
  const { user } = useUser();

  const [branch, setBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchLocked, setBranchLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeBranchState = async () => {
      // Only proceed if a user is logged in.
      if (user) {
        setLoading(true);
        setError("");
        try {
          // --- THIS IS THE CRITICAL LOGIC ---
          if (user.role === "ADMIN") {
            // Admins can see all branches. Call the general endpoint.
            console.log("User is ADMIN, fetching all branches...");
            const branchesData = await authenticatedFetch("/api/branches");
            setBranches(branchesData || []);

            const defaultBranch =
              branchesData.find((b) => b.name === "Main") || branchesData[0];
            setBranch(defaultBranch);
            setBranchLocked(false);
            console.log("Admin branches loaded.", branchesData);
          } else {
            // Managers and Cashiers can only see their OWN branch.
            // Call our new, specific endpoint.
            console.log("User is not Admin, fetching their specific branch...");
            const myBranchData = await authenticatedFetch(
              "/api/branches/my-branch"
            );

            // The list of branches for them is just an array with their one branch.
            setBranches(myBranchData ? [myBranchData] : []);

            // Their default branch IS their only branch.
            setBranch(myBranchData || null);
            setBranchLocked(true); // They are locked to this branch.
            console.log("User branch loaded.", myBranchData);
          }
        } catch (err) {
          console.error("Failed to initialize branch state:", err.message);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // If the user logs out, clear all branch state.
        setBranch(null);
        setBranches([]);
        setBranchLocked(false);
        setError("");
      }
    };

    initializeBranchState();
  }, [user]); // Dependency array ensures this runs only when `user` changes.

  const value = useMemo(
    () => ({
      branch,
      setBranch,
      branches,
      branchLocked,
      loading,
      error,
    }),
    [branch, branches, branchLocked, loading, error]
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
};
