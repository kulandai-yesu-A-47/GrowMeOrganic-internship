import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import type { PaginatorPageChangeEvent } from 'primereact/paginator';
import { Checkbox } from 'primereact/checkbox';
import './App.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

interface ApiResponse {
  data: Artwork[];
  pagination: {
    total: number;
    total_pages: number;
    current_page: number;
  };
}

interface SelectionState {
  [page: number]: {
    [id: string]: boolean;
  };
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<SelectionState>({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
      );
      const data: ApiResponse = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setCurrentPage(event.page + 1); 
  };

  const onRowSelectionChange = (e: any, rowData: Artwork) => {
    const newSelections = { ...selectedRows };
    
    if (!newSelections[currentPage]) {
      newSelections[currentPage] = {};
    }
    
    if (e.checked) {
      newSelections[currentPage][rowData.id] = true;
    } else {
      delete newSelections[currentPage][rowData.id];
    }
    
    setSelectedRows(newSelections);
    setSelectAll(false);
  };

  const onSelectAllChange = (e: any) => {
    const newSelections = { ...selectedRows };
    
    if (!newSelections[currentPage]) {
      newSelections[currentPage] = {};
    }
    
    if (e.checked) {
      artworks.forEach(artwork => {
        newSelections[currentPage][artwork.id] = true;
      });
    } else {
      newSelections[currentPage] = {};
    }
    
    setSelectedRows(newSelections);
    setSelectAll(e.checked);
  };

  const isRowSelected = (id: number) => {
    return selectedRows[currentPage]?.[id] || false;
  };

  const isAllSelected = () => {
    return artworks.length > 0 && artworks.every(artwork => isRowSelected(artwork.id));
  };

  const getSelectedCount = () => {
    let count = 0;
    for (const page in selectedRows) {
      count += Object.keys(selectedRows[page]).length;
    }
    return count;
  };

  const selectionHeaderTemplate = () => {
    return (
      <div className="flex align-items-center">
        <Checkbox 
          onChange={onSelectAllChange} 
          checked={isAllSelected()} 
        />
      </div>
    );
  };

  const selectionBodyTemplate = (rowData: Artwork) => {
    return (
      <div className="flex align-items-center">
        <Checkbox 
          onChange={(e) => onRowSelectionChange(e, rowData)} 
          checked={isRowSelected(rowData.id)} 
        />
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Art Institute of Chicago - Artworks</h1>
        
        <div className="selection-panel">
          <h3>Selected Artworks: {getSelectedCount()}</h3>
        </div>

        <DataTable value={artworks} loading={loading} className="p-datatable-sm">
          <Column 
            header={selectionHeaderTemplate} 
            body={selectionBodyTemplate} 
            style={{ width: '3rem' }} 
          />
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Origin" />
          <Column field="artist_display" header="Artist" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Start Date" />
          <Column field="date_end" header="End Date" />
        </DataTable>

        <Paginator
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        />
      </div>
    </div>
  );
}

export default App;