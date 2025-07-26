import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Collapse,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PrintIcon from "@mui/icons-material/Print";
import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";

const initialFormState = {
  invoice: "",
  datetime: "",
  branchId: "",
  userId: "",
  paymentType: "",
  discount: 0,
  items: [],
};

const calcItemTotal = (item) => {
  if (!item) return 0;
  const base = (item.quantity || 0) * (item.price || 0);
  const discount = base * (Number(item.discount || 0) / 100);
  const taxed = (base - discount) * (1 + Number(item.tax || 0) / 100);
  return Math.round(taxed * 100) / 100;
};
const calcSubtotal = (items) =>
  Array.isArray(items)
    ? items.reduce((sum, item) => sum + calcItemTotal(item), 0)
    : 0;
const calcTotal = (items, basketDiscount = 0) => {
  const subtotal = calcSubtotal(items);
  const discountAmt = subtotal * (Number(basketDiscount) / 100);
  return Math.round((subtotal - discountAmt) * 100) / 100;
};

const BillPrint = React.forwardRef(({ sale, settings }, ref) => {
  if (!sale || !settings) return null;
  return (
    <div
      ref={ref}
      style={{
        fontFamily: "monospace",
        width: 350,
        margin: "0 auto",
        padding: 16,
      }}
    >
      <h2 style={{ textAlign: "center", margin: 0 }}>POS Terminal</h2>
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        <div>
          <strong>Invoice:</strong> {sale.invoice}
        </div>
        <div>
          <strong>Date/Time:</strong> {new Date(sale.datetime).toLocaleString()}
        </div>
        <div>
          <strong>Payment:</strong> {sale.paymentType}
        </div>
      </div>
      <table
        style={{
          width: "100%",
          fontSize: 13,
          borderCollapse: "collapse",
          marginBottom: 8,
        }}
      >
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="right">Qty</th>
            <th align="right">Price</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(sale.items) &&
            sale.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.product?.name || "N/A"}</td>
                <td align="right">{item.quantity}</td>
                <td align="right">{item.price.toFixed(2)}</td>
                <td align="right">{calcItemTotal(item).toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div style={{ borderTop: "1px dashed #888", margin: "8px 0" }}></div>
      <div style={{ fontSize: 13, textAlign: "right" }}>
        <div>
          <strong>Subtotal:</strong> {settings.currency}{" "}
          {calcSubtotal(sale.items).toFixed(2)}
        </div>
        <div>
          <strong>Discount:</strong> {sale.discount || 0}%
        </div>
        <div>
          <strong>Total:</strong> {settings.currency}{" "}
          {calcTotal(sale.items, sale.discount).toFixed(2)}
        </div>
      </div>
    </div>
  );
});

const Sales = () => {
  const { tenant } = useTenant();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [printSale, setPrintSale] = useState(null);
  const printWindowRef = useRef(null);

  const callApi = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errData = await response
        .json()
        .catch(() => ({ message: "An unknown error occurred" }));
      throw new Error(errData.message);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenant) return;
      setLoading(true);
      setError("");
      try {
        const [salesData, inventoryData, branchesData, usersData] =
          await Promise.all([
            callApi("/api/sales"),
            callApi("/api/inventory"),
            callApi("/api/branches"),
            callApi("/api/users"),
          ]);
        setSales(salesData || []);
        setInventory(inventoryData || []);
        setBranches(branchesData || []);
        setUsers(usersData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenant, callApi]);

  const availableProductsForSelectedBranch = useMemo(() => {
    if (!form.branchId) return [];
    return inventory
      .filter((inv) => inv.branchId === form.branchId && inv.stock > 0)
      .map((inv) => inv.product);
  }, [form.branchId, inventory]);

  const handleOpen = async () => {
    try {
      const { invoice } = await callApi("/api/sales/utils/new-invoice");
      const datetime = new Date().toISOString().slice(0, 16);
      setForm({
        ...initialFormState,
        invoice,
        datetime,
        paymentType: settings?.paymentTypes[0] || "",
      });
      setFormErrors([]);
      setIsEditing(false);
      setOpen(true);
    } catch (err) {
      setError("Failed to generate a new invoice number.");
    }
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (idx, field, value) => {
    const newItems = [...form.items];
    const item = { ...newItems[idx] };
    if (field === "productId") {
      const invItem = inventory.find(
        (inv) => inv.branchId === form.branchId && inv.productId === value
      );
      item.productId = value;
      item.price = invItem ? invItem.product.price : 0;
      item.quantity = 1;
      item.discount = 0;
      item.tax = 0;
    } else if (field === "quantity") {
      const invItem = inventory.find(
        (inv) =>
          inv.branchId === form.branchId && inv.productId === item.productId
      );
      if (invItem && Number(value) > invItem.stock) {
        alert(`Quantity cannot exceed available stock of ${invItem.stock}`);
        item.quantity = invItem.stock;
      } else {
        item.quantity = Number(value);
      }
    } else {
      item[field] = value;
    }
    newItems[idx] = item;
    setForm((f) => ({ ...f, items: newItems }));
  };

  const handleAddItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", quantity: 1, discount: 0, tax: 0 }],
    }));
  const handleRemoveItem = (idx) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setFormErrors([]);
    try {
      await callApi("/api/sales", {
        method: "POST",
        body: JSON.stringify(form),
      });
      handleClose();
      const [salesData, inventoryData] = await Promise.all([
        callApi("/api/sales"),
        callApi("/api/inventory"),
      ]);
      setSales(salesData || []);
      setInventory(inventoryData || []);
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await callApi(`/api/sales/${id}`, { method: "DELETE" });
      const salesData = await callApi("/api/sales");
      setSales(salesData || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExpandClick = (id) =>
    setExpanded((exp) => ({ ...exp, [id]: !exp[id] }));

  const handlePrint = (saleToPrint) => {
    setPrintSale(saleToPrint);
    setTimeout(() => {
      if (printWindowRef.current) {
        const printContents = printWindowRef.current.innerHTML;
        const printWindow = window.open("", "", "width=400,height=800");
        printWindow.document.write(
          "<html><head><title>Print Bill</title></head><body>"
        );
        printWindow.document.write(printContents);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setPrintSale(null);
        }, 300);
      }
    }, 100);
  };

  if (loading || settingsLoading) return <CircularProgress />;
  if (error || settingsError)
    return <Alert severity="error">{error || settingsError}</Alert>;
  if (!settings)
    return <Alert severity="warning">Could not load tenant settings.</Alert>;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Sales</Typography>
        <Button variant="contained" onClick={handleOpen}>
          New Sale
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Date/Time</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Salesperson</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((s) => (
              <React.Fragment key={s.id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleExpandClick(s.id)}
                    >
                      {expanded[s.id] ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{new Date(s.datetime).toLocaleString()}</TableCell>
                  <TableCell>{s.invoice}</TableCell>
                  <TableCell>{s.user?.name || "N/A"}</TableCell>
                  <TableCell>
                    {settings.currency} {s.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handlePrint(s)}
                      size="small"
                      title="Print Bill"
                    >
                      <PrintIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(s.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ padding: 0 }} colSpan={6}>
                    <Collapse in={expanded[s.id]} timeout="auto" unmountOnExit>
                      <Box m={2}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell>Qty</TableCell>
                              <TableCell>Price</TableCell>
                              <TableCell>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {s.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  {settings.currency} {item.price.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  {settings.currency}{" "}
                                  {calcItemTotal(item).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <div style={{ display: "none" }}>
        <BillPrint ref={printWindowRef} sale={printSale} settings={settings} />
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? "Edit Sale" : "New Sale"}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.join(", ")}
            </Alert>
          )}

          {/* --- THIS IS THE CORRECTED LAYOUT --- */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                margin="dense"
                label="Invoice #"
                value={form.invoice}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm="auto" sx={{ minWidth: 200, flexGrow: 1 }}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Branch</InputLabel>
                <Select
                  name="branchId"
                  value={form.branchId}
                  label="Branch"
                  onChange={handleChange}
                >
                  {branches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm="auto" sx={{ minWidth: 200, flexGrow: 1 }}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Salesperson</InputLabel>
                <Select
                  name="userId"
                  value={form.userId}
                  label="Salesperson"
                  onChange={handleChange}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" mb={1}>
              Items
            </Typography>

            {form.items.map((item, idx) => (
              <Grid
                container
                spacing={1}
                alignItems="center"
                key={idx}
                sx={{ mb: 1, flexWrap: "nowrap" }} // no wrapping
              >
                {/* Product Selector */}
                <Grid item sx={{ minWidth: 200, flexBasis: "20%" }}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={item.productId}
                      label="Product"
                      onChange={(e) =>
                        handleItemChange(idx, "productId", e.target.value)
                      }
                      disabled={!form.branchId}
                    >
                      {availableProductsForSelectedBranch.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Qty */}
                <Grid item sx={{ flexBasis: "8%" }}>
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", e.target.value)
                    }
                    fullWidth
                  />
                </Grid>

                {/* Discount */}
                <Grid item sx={{ flexBasis: "8%" }}>
                  <TextField
                    label="Discount (%)"
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      handleItemChange(idx, "discount", e.target.value)
                    }
                    fullWidth
                  />
                </Grid>

                {/* Tax */}
                <Grid item sx={{ flexBasis: "8%" }}>
                  <TextField
                    label="Tax (%)"
                    type="number"
                    value={item.tax}
                    onChange={(e) =>
                      handleItemChange(idx, "tax", e.target.value)
                    }
                    fullWidth
                  />
                </Grid>

                {/* Total */}
                <Grid item sx={{ flexBasis: "12%" }}>
                  <Typography
                    variant="body1"
                    align="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    {settings.currency} {calcItemTotal(item).toFixed(2)}
                  </Typography>
                </Grid>

                {/* Remove Button */}
                <Grid item sx={{ flexBasis: "6%", textAlign: "right" }}>
                  <IconButton
                    onClick={() => handleRemoveItem(idx)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            {/* Add Item Button */}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ mt: 1 }}
              disabled={!form.branchId}
            >
              Add Item
            </Button>
          </Box>

          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4} sx={{ minWidth: 160 }}>
              <FormControl fullWidth margin="dense" sx={{ minWidth: 160 }}>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  name="paymentType"
                  value={form.paymentType}
                  label="Payment Type"
                  onChange={handleChange}
                >
                  {settings.paymentTypes.map((type) => (
                    <MenuItem value={type} key={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Basket Discount (%)"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                type="number"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: "right" }}>
              <Typography variant="h6">
                Total: {settings.currency}{" "}
                {calcTotal(form.items, form.discount).toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        {/* --- END OF CORRECTED LAYOUT --- */}

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? "Save" : "Create Sale"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;
