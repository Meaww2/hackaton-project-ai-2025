import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-managemet',
  templateUrl: './stock-managemet.component.html',
  styleUrl: './stock-managemet.component.scss'
})
export class StockManagemetComponent {
  constructor(private http: HttpClient) { }

  movementTypeOptions = [
    { label: 'Receiving (IN)', value: 'IN' },
    { label: 'Issuing (OUT)', value: 'OUT' }
  ];
  quantityOptions = [10, 20, 50, 100].map(q => ({ label: q.toString(), value: q }));
  referenceOptions: any[] = [];

  selectedId: number | null = null;
  selectedProduct: string | null = null;
  selectedMovementType: string | null = null;
  selectedQuantity: number | null = null;
  selectedReference: string | null = null;
  movements: any[] = [];

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.http.get<any[]>('http://localhost:3000/api/v1/stock_movements')
      .subscribe(data => {
        this.movements = data;
        const refs = Array.from(new Set(data.map(m => m.reference))).filter(Boolean);
        this.referenceOptions = refs.map(r => ({ label: r, value: r }));
      });
  }

  editMovement(m: any) {
    this.selectedId = m.id;
    this.selectedProduct = m.product?.sku || m.product;
    this.selectedMovementType = m.status === 'received' ? 'IN' : 'OUT';
    this.selectedQuantity = m.quantity;
    this.selectedReference = m.reference;
  }

  saveMovement() {
    if (this.selectedProduct && this.selectedMovementType && this.selectedQuantity && this.selectedReference) {
      const payload = {
        product_code: this.selectedProduct,
        movement_type: this.selectedMovementType,
        quantity: this.selectedQuantity,
        reference: this.selectedReference
      };

      if (this.selectedId) {
        // Update
        this.http.put(`http://localhost:3000/api/v1/stock_movements/${this.selectedId}`, payload)
          .subscribe({
            next: () => { this.loadMovements(); this.resetForm(); },
            error: (err) => alert('Error updating: ' + (err.error?.error || 'Unknown error'))
          });
      } else {
        // Create
        this.http.post('http://localhost:3000/api/v1/stock_movements', payload)
          .subscribe({
            next: () => { this.loadMovements(); this.resetForm(); },
            error: (err) => alert('Error creating: ' + (err.error?.error || 'Unknown error'))
          });
      }
    } else {
      alert('Please fill in all fields.');
    }
  }

  resetForm() {
    this.selectedId = null;
    this.selectedProduct = null;
    this.selectedMovementType = null;
    this.selectedQuantity = null;
    this.selectedReference = null;
  }
}
