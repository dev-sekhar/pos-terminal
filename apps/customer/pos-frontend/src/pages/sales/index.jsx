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
import { useUser } from "../../context/UserContext";
import { useBranch } from "../../context/BranchContext";
import { authenticatedFetch } from "../../utils/api";
import { calcItemTotal, calcSubtotal, calcTotal } from "../../utils/salesUtils";
import SalesTable from "./SalesTable";
import NewSaleDialog from "./NewSaleDialog";
import PrintLayout from "../../components/PrintLayout";
import SearchBar from "../../components/SearchBar";
import ReadOnlyAlert from "../../components/ReadOnlyAlert";
import { usePaymentStatus } from "../../hooks/usePaymentStatus";
import "../../styles/PrintLayout.css";
import "../../styles/Sales.css";

const Sales = () => {
  const { tenant } = useTenant();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const { user } = useUser();
  const { branch, branches, loading: branchLoading } = useBranch();
  const { canEdit } = usePaymentStatus();

  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
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
      const [salesData, inventoryData] = await Promise.all([
        authenticatedFetch("/api/sales"),
        authenticatedFetch("/api/inventory/for-sales"),
      ]);
      setSales(salesData || []);
      setInventory(inventoryData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenant, branch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    const calculatedTotal = calcTotal(formData.items, formData.discount);
    const saleData = {
      ...formData,
      total: calculatedTotal,
      userName: user?.name || tenant?.name || "System",
    };
    
    try {
      const newSale = await authenticatedFetch("/api/sales", {
        method: "POST",
        body: JSON.stringify(saleData),
      });
      setOpen(false);
      fetchData();
      // Highlight the newly added sale
      setTimeout(() => {
        const element = document.querySelector(`[data-sale-id="${newSale.id}"]`);
        if (element) {
          element.style.backgroundColor = '#e8f5e8';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 3000);
        }
      }, 100);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await authenticatedFetch(`/api/sales/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExpandClick = (id) =>
    setExpanded((exp) => ({ ...exp, [id]: !exp[id] }));

  // --- THIS IS THE RESTORED PRINT LOGIC ---
  const handlePrint = (saleToPrint) => {
    const currency = settings?.currency || "$";
    const dataForPrint = {
      title: "Sales Receipt",
      companyName: tenant,
      details: [
        { label: "Invoice #", value: saleToPrint.invoice },
        {
          label: "Date",
          value: new Date(saleToPrint.datetime).toLocaleString(),
        },
        { label: "Payment", value: saleToPrint.paymentType },
      ],
      tableHeaders: [
        { label: "Item", align: "left" },
        { label: "Qty", align: "right" },
        { label: "Price", align: "right" },
        { label: "Total", align: "right" },
      ],
      tableData: saleToPrint.items.map((item) => [
        item.product.name,
        item.quantity,
        item.price.toFixed(2),
        calcItemTotal(item).toFixed(2),
      ]),
      totals: [
        {
          label: "Subtotal",
          value: `${currency} ${calcSubtotal(saleToPrint.items).toFixed(2)}`,
        },
        { 
          label: "Item Discount", 
          value: `${currency} ${saleToPrint.items.reduce((sum, item) => sum + (item.discount || 0), 0).toFixed(2)}` 
        },
        { 
          label: "Item Tax", 
          value: `${currency} ${saleToPrint.items.reduce((sum, item) => sum + (item.tax || 0), 0).toFixed(2)}` 
        },
        { label: "Sale Discount", value: `${saleToPrint.discount || 0}%` },
        {
          label: "Total",
          value: `${currency} ${calcTotal(
            saleToPrint.items,
            saleToPrint.discount
          ).toFixed(2)}`,
        },
      ],
    };

    setPrintData(dataForPrint);

    setTimeout(() => {
      if (printRef.current) {
        const printContents = printRef.current.innerHTML;
        const printWindow = window.open("", "", "width=400,height=800");
        printWindow.document.write(
          `<html><head><title>Print</title><link rel="stylesheet" href="/src/styles/PrintLayout.css" type="text/css" media="print"/></head><body>${printContents}</body></html>`
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
  // --- END OF RESTORED LOGIC ---

  if (loading || settingsLoading || branchLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || settingsError)
    return <Alert severity="error">{error || settingsError}</Alert>;

  // Filter sales based on search term
  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.invoice.toLowerCase().includes(searchLower) ||
      sale.datetime.split('T')[0].includes(searchTerm) || // Use only date part (YYYY-MM-DD)
      sale.user?.name.toLowerCase().includes(searchLower) || // Salesperson
      sale.branch?.name.toLowerCase().includes(searchLower) || // Branch
      sale.items?.some(item => 
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
        <Typography variant="h4">Sales</Typography>
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
          disabled={!canEdit}
        >
          New Sale
        </Button>
      </Box>

      <ReadOnlyAlert />

      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search sales by invoice, date, salesperson, branch, or product..."
        helperText="Search by invoice, salesperson, branch, product name, or date (YYYY-MM-DD format)"
      />

      <SalesTable
        sales={filteredSales}
        settings={settings}
        expanded={expanded}
        onExpandClick={handleExpandClick}
        onPrint={handlePrint}
        onDelete={canEdit ? handleDelete : null}
        canEdit={canEdit}
      />

      <NewSaleDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        user={user}
        branch={branch}
        branches={branches}
        inventory={inventory}
        settings={settings}
      />

      <div style={{ display: "none" }}>
        {printData && <PrintLayout ref={printRef} {...printData} />}
      </div>
    </Box>
  );
};

export default Sales;
