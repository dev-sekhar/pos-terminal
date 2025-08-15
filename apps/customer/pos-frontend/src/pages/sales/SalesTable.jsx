import React from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PrintIcon from "@mui/icons-material/Print";
import { calcItemTotal } from "../../utils/salesUtils";
import { formatDate } from "../../utils/dateFormatter";

const SalesTable = ({
  sales,
  expanded,
  onExpandClick,
  onPrint,
  onDelete,
  settings,
}) => {
  const currency = settings?.currency || "$";

  return (
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
                  <IconButton size="small" onClick={() => onExpandClick(s.id)}>
                    {expanded[s.id] ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell>
                  {formatDate(s.datetime, settings?.timezone)}
                </TableCell>
                <TableCell>{s.invoice}</TableCell>
                <TableCell>{s.user?.name || "N/A"}</TableCell>
                <TableCell>
                  {currency} {s.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => onPrint(s)}
                    size="small"
                    title="Print Bill"
                  >
                    <PrintIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(s.id)}
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
                                {currency} {item.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {currency} {calcItemTotal(item).toFixed(2)}
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
  );
};

export default SalesTable;
