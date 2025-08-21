import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Collapse, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PrintIcon from '@mui/icons-material/Print';
import { formatDate } from '../../utils/dateFormatter'; // Import the utility

const PurchasesTable = ({ purchases, expanded, onExpandClick, onPrint, onDelete, settings }) => {
  const currency = settings?.currency || '$';

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Date/Time</TableCell>
            <TableCell>PO #</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Branch</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {purchases.map(p => (
            <React.Fragment key={p.id}>
              <TableRow data-purchase-id={p.id}>
                <TableCell><IconButton size="small" onClick={() => onExpandClick(p.id)}>{expanded[p.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton></TableCell>
                {/* --- THIS IS THE FIX --- */}
                <TableCell>{formatDate(p.datetime, settings?.timezone)}</TableCell>
                <TableCell>{p.poNumber}</TableCell>
                <TableCell>{p.supplier?.name || 'N/A'}</TableCell>
                <TableCell>{p.branch?.name || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onPrint(p)} size="small" title="Print PO"><PrintIcon /></IconButton>
                  <IconButton onClick={() => onDelete(p.id)} color="error" size="small"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={6}>
                  <Collapse in={expanded[p.id]} timeout="auto" unmountOnExit>
                    <Box m={2}>
                      <Table size="small">
                        <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Quantity</TableCell></TableRow></TableHead>
                        <TableBody>{p.items.map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                          </TableRow>
                        ))}</TableBody>
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

export default PurchasesTable;