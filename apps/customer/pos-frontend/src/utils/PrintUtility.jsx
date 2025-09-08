const printUtility = (contentHtml, title = 'Print Document', windowFeatures = 'width=800,height=800') => {
  const printWindow = window.open('', '_blank', windowFeatures);
  if (!printWindow) {
    alert('Pop-up blocked! Please allow pop-ups for this site to print.');
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <link rel="stylesheet" href="/src/styles/PrintLayout.css" type="text/css" media="print"/>
      </head>
      <body>
        ${contentHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

export default printUtility;