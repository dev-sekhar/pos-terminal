import React from 'react';
import '../styles/PrintLayout.css'; // We'll create this CSS file next

const PrintLayout = React.forwardRef(({ title, companyName, printHeader, printFooter, details, tableHeaders, tableData, totals }, ref) => {
  if (!details || !tableData) return null;

  return (
    <div ref={ref} className="print-layout">
      {printHeader && <div className="print-header-content">{printHeader}</div>}
      <h2 className="print-header">{title}</h2>
      {companyName && <p className="print-company-name">{companyName}</p>}
      <div className="print-divider"></div>

      <div className="print-info">
        {details.map((detail, index) => (
          <div key={index}>
            <strong>{detail.label}:</strong> {detail.value}
          </div>
        ))}
      </div>
      <div className="print-divider"></div>

      <table className="print-table">
        <thead>
          <tr>
            {tableHeaders.map((header, index) => (
              <th key={index} align={header.align || 'left'}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} align={tableHeaders[cellIndex]?.align || 'left'}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {totals && totals.length > 0 && (
        <>
          <div className="print-divider"></div>
          <div className="print-totals">
            {totals.map((total, index) => (
              <div key={index}>
                <strong>{total.label}:</strong> {total.value}
              </div>
            ))}
          </div>
        </>
      )}
      {printFooter && <div className="print-footer-content">{printFooter}</div>}
    </div>
  );
});

export default PrintLayout;