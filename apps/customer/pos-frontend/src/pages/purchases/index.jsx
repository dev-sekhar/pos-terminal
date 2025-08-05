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
    await authenticatedFetch("/api/purchases", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setOpen(false);
    fetchData();
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
      totals: [
        {
          label: "Total",
          value: `${settings?.currency || "$"} ${purchaseToPrint.total.toFixed(
            2
          )}`,
        },
      ],
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

      <PurchasesTable
        purchases={purchases}
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
