import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { getTransactionReport } from "../../services/transactionReport";
import { transactionReportData } from "../../services/transactionReportData";
import "./transactionReport.css";
// xlsx for client side export. Ensure dependency installed: npm i xlsx file-saver
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function TransactionReport() {

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(''); // will hold id (number/string)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [schemeDetails, setSchemeDetails] = useState([]);

  // helper to format numbers with commas
  const fmt = (v) => {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'number') return v.toLocaleString();
    const n = Number(v);
    return Number.isNaN(n) ? v : n.toLocaleString();
  };

  useEffect(() => {
    let mounted = true;
    const fetchYears = async () => {
      setLoading(true);
      const res = await getTransactionReport();
      if (!mounted) return;
      setLoading(false);
      if (res && res.responseCode === 200 && Array.isArray(res.responseObject)) {
        setYears(res.responseObject);
        if (res.responseObject.length > 0) setSelectedYear(res.responseObject[0].id);
      } else {
        setError(res?.responseDesc || res?.message || 'Failed to load years');
      }
    };

    fetchYears();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Navbar />
      <div className="container report-container FontSize mt-4">
        <h3 className="mb-3">DBT Transaction Report</h3>

        <div className="mb-3 report-row report-controls">
          <div className="report-left">
            <label className="form-label small-label">Financial Year</label>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-danger">{error}</div>
            ) : (
              <>
          <div className="d-flex align-items-center">
  <select
    className="fy-input form-select border border-black me-2"  // <-- added margin-end for spacing
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    style={{ width: '200px' }} // optional: set width if needed
  >
    {years.map((year) => (
      <option key={year.id} value={year.id}>
        {year.name}
      </option>
    ))}
  </select>

  <div className="report-right">
    <button
      className="search-btn btn btn-primary"
      onClick={async () => {
        setReportLoading(true);
        setDashboard(null);
        setSchemeDetails([]);
        const payload = { fiancialYear: String(selectedYear) };
        const res = await transactionReportData(payload);
        setReportLoading(false);
        if (res && (res.responseCode === 200 || res.success === true) && res.responseObject) {
          setDashboard(res.responseObject.schemeDetailsDashboard || null);
          const list =
            res.responseObject.schemeDetailsDashboards ||
            res.responseObject.schemeDetails ||
            [];
          setSchemeDetails(Array.isArray(list) ? list : []);
        } else if (res && res.success === true && res.data) {
          setDashboard(res.data.schemeDetailsDashboard || null);
          setSchemeDetails(res.data.schemeDetailsDashboards || []);
        } else {
          setError(res?.responseDesc || res?.message || 'Failed to load report');
        }
      }}
      disabled={!selectedYear || reportLoading}
    >
      {reportLoading ? 'Searching...' : 'Search'}
    </button>
  </div>
</div>

                { (dashboard || (schemeDetails && schemeDetails.length > 0)) && (
                  <button
                    className="download-btn download-left"
                    onClick={() => {
                      let rows = schemeDetails.map((s, idx) => ({
                        Sno: idx + 1,
                        Department: s.departmentName,
                        SchemeName: s.schemeName,
                        TotalBeneficiaries: s.totalBeneficiaries,
                        TotalAadharSeeded: s.aadharSeeded,
                        TotalTransactionsElectronic: s.totalTransactionsElectronicModesCash,
                        TotalTransactionsOther: s.totalTransactionsOtherModesCash,
                        QuantityTransferredInKind: s.quantityTransferredInkind,
                        Amount: s.amount,
                      }));

                      // Add totals row at the end
                      const totalsRow = {
                        Sno: 'Total',
                        Department: '-',
                        SchemeName: '-',
                        TotalBeneficiaries: schemeDetails.reduce((a, b) => a + (Number(b.totalBeneficiaries) || 0), 0),
                        TotalAadharSeeded: schemeDetails.reduce((a, b) => a + (Number(b.aadharSeeded) || 0), 0),
                        TotalTransactionsElectronic: schemeDetails.reduce((a, b) => a + (Number(b.totalTransactionsElectronicModesCash) || 0), 0),
                        TotalTransactionsOther: schemeDetails.reduce((a, b) => a + (Number(b.totalTransactionsOtherModesCash) || 0), 0),
                        QuantityTransferredInKind: schemeDetails.reduce((a, b) => a + (Number(b.quantityTransferredInkind) || 0), 0),
                        Amount: schemeDetails.reduce((a, b) => a + (Number(b.amount) || 0), 0),
                      };

                      rows.push(totalsRow);

                      const ws = XLSX.utils.json_to_sheet(rows);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Report');
                      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                      try {
                        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `transaction-report-${selectedYear || 'data'}.xlsx`);
                      } catch (e) {
                        XLSX.writeFile(wb, `transaction-report-${selectedYear || 'data'}.xlsx`);
                      }
                    }}
                  >
                    Download
                  </button>
                ) }
              </>
            )}
          </div>

         
        </div>

    

        {/* Table of schemes */}
        {schemeDetails && schemeDetails.length > 0 && (
          <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Sno</th>
                  <th>Department</th>
                  <th>Scheme Name</th>
                  <th>Total Beneficiaries</th>
                  <th>Total Aadhar Seeded</th>
                  <th>Total Transactions (Electronic)</th>
                  <th>Total Transactions (Other)</th>
                  <th>Quantity Transferred (In Kind)</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {schemeDetails.map((s, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{s.departmentName}</td>
                    <td>{s.schemeName}</td>
                    <td>{fmt(s.totalBeneficiaries)}</td>
                    <td>{fmt(s.aadharSeeded)}</td>
                    <td>{fmt(s.totalTransactionsElectronicModesCash)}</td>
                    <td>{fmt(s.totalTransactionsOtherModesCash)}</td>
                    <td>{fmt(s.quantityTransferredInkind)}</td>
                    <td>{fmt(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>-</td>
                  <td>-</td>
                  <td>{fmt(schemeDetails.reduce((a, b) => a + (Number(b.totalBeneficiaries) || 0), 0))}</td>
                  <td>{fmt(schemeDetails.reduce((a, b) => a + (Number(b.aadharSeeded) || 0), 0))}</td>
                  <td>{fmt(schemeDetails.reduce((a, b) => a + (Number(b.totalTransactionsElectronicModesCash) || 0), 0))}</td>
                  <td>{fmt(schemeDetails.reduce((a, b) => a + (Number(b.totalTransactionsOtherModesCash) || 0), 0))}</td>
                  <td>{fmt(schemeDetails.reduce((a, b) => a + (Number(b.quantityTransferredInkind) || 0), 0))}</td>
                  <td>{fmt(schemeDetails.reduce((a, b) => a + (Number(b.amount) || 0), 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

      </div>
      <div style={{ marginTop: '100px' }}><Footer /></div>
    </>
  );
}

export default TransactionReport;
