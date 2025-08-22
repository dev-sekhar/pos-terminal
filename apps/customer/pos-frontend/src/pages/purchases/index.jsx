import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTenant } from "../../context/TenantContext";
import { useSettings } from "../../context/SettingsContext";
import { useBranch } from "../../context/BranchContext";
import { authenticatedFetch } from "../../utils/api";
import PurchasesTable from "./PurchasesTable";
import NewPurchaseDialog from "./NewPurchaseDialog";
import PrintLayout from "../../components/PrintLayout";
import SearchBar from "../../components/SearchBar";
import "../../styles/PrintLayout.css";

const Purchases = () => {
  const { tenant } = useTenant();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const { branch, branches, loading: branchLoading } = useBranch();

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [printData, setPrintData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!tenant || !branch) return;
    setLoading(true);
    setError("");
    try {
      // --- THIS IS THE FIX ---
      // The component does not need to fetch branches; it gets them from the context.
      // We only need to fetch the data specific to this page.
      const [purchasesData, suppliersData, productsData] = await Promise.all([
        authenticatedFetch("/api/purchases"),
        authenticatedFetch("/api/suppliers"),
        authenticatedFetch("/api/products"),
      ]);
      setPurchases(purchasesData || []);
      setSuppliers(suppliersData || []);
      setProducts(productsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // This will now execute correctly.
    }
  }, [tenant, branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    const newPurchase = await authenticatedFetch("/api/purchases", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setOpen(false);
    fetchData();
    // Highlight the newly added purchase
    setTimeout(() => {
      const element = document.querySelector(`[data-purchase-id="${newPurchase.id}"]`);
      if (element) {
        element.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 3000);
      }
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await authenticatedFetch(`/api/purchases/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleExpandClick = (id) =>
    setExpanded((exp) => ({ ...exp, [id]: !exp[id] }));

  const handlePrint = (purchaseToPrint) => {
    const dataForPrint = {
      title: "Purchase Order",
      companyName: tenant,
      details: [
        { label: "PO #", value: purchaseToPrint.poNumber },
        {
          label: "Date",
          value: new Date(purchaseToPrint.datetime).toLocaleDateString(),
        },
        { label: "Supplier", value: purchaseToPrint.supplier?.name || "N/A" },
        { label: "Branch", value: purchaseToPrint.branch?.name || "N/A" },
      ],
      tableHeaders: [
        { label: "Item", align: "left" },
        { label: "Qty", align: "right" },
      ],
      tableData: purchaseToPrint.items.map((item) => [
        item.product.name,
        item.quantity,
      ]),
      totals: [],
    };
    setPrintData(dataForPrint);
    setTimeout(() => {
      if (printRef.current) {
        const printContents = printRef.current.innerHTML;
        const printWindow = window.open("", "", "width=400,height=600");
        printWindow.document.write(
          `<html><head><title>Print PO</title><link rel="stylesheet" href="/src/styles/PrintLayout.css" type="text/css" media="print"/></head><body>${printContents}</body></html>`
        );
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setPrintData(null);
        }, 300);
      }
    }, 100);
  };

  // The guard is correct: it waits for this component's data AND the context data.
  if (loading || settingsLoading || branchLoading) return <CircularProgress />;
  if (error || settingsError)
    return <Alert severity="error">{error || settingsError}</Alert>;

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(purchase => {
    const searchLower = searchTerm.toLowerCase();
    return (
      purchase.poNumber.toLowerCase().includes(searchLower) ||
      purchase.datetime.split('T')[0].includes(searchTerm) || // Use only date part (YYYY-MM-DD)
      purchase.supplier?.name.toLowerCase().includes(searchLower) || // Supplier
      purchase.branch?.name.toLowerCase().includes(searchLower) || // Branch
      purchase.items?.some(item => 
        item.product?.name.toLowerCase().includes(searchLower) // Product names
      )
    );
  });

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Purchases</Typography>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          disabled={loading || branchLoading}
        >
          New Purchase
        </Button>
      </Box>

      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search purchases by PO number, date, supplier, branch, or product..."
        helperText="Search by PO number, supplier, branch, product name, or date (YYYY-MM-DD format)"
      />

      <PurchasesTable
        purchases={filteredPurchases}
        settings={settings}
        expanded={expanded}
        onExpandClick={handleExpandClick}
        onPrint={handlePrint}
        onDelete={handleDelete}
      />

      <NewPurchaseDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        branch={branch}
        branches={branches} // Pass the branches from the context to the dialog
        products={products}
        suppliers={suppliers}
      />

      <div style={{ display: "none" }}>
        {printData && <PrintLayout ref={printRef} {...printData} />}
      </div>
    </Box>
  );
};

export default Purchases;
