import { Component } from '@angular/core';

@Component({
  selector: 'app-stock-managemet',
  templateUrl: './stock-managemet.component.html',
  styleUrl: './stock-managemet.component.scss'
})
export class StockManagemetComponent {
  
  items = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Orange', value: 'orange' }
  ];

  selectedItem: string | null = null;

  onItemChange(event: any) {
    console.log('Selected:', event.value);
  }
  productOptions = [
    { label: 'A001 - Product A', value: 'A001' },
    { label: 'B002 - Product B', value: 'B002' },
    { label: 'C003 - Product C', value: 'C003' }
  ];

  movementTypeOptions = [
    { label: 'Receiving (IN)', value: 'IN' },
    { label: 'Issuing (OUT)', value: 'OUT' }
  ];

  quantityOptions = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  referenceOptions = [
    { label: 'REF001', value: 'REF001' },
    { label: 'REF002', value: 'REF002' },
    { label: 'REF003', value: 'REF003' }
  ];

  // Selected values
  selectedProduct: string | null = null;
  selectedMovementType: string | null = null;
  selectedQuantity: number | null = null;
  selectedReference: string | null = null;

  // Stock movement records
  movements = [
    {
      date: '2023-10-01 09:30',
      product: 'Product B',
      type: 'IN',
      quantity: 20,
      reference: 'REF001'
    },
    {
      date: '2023-10-01 11:00',
      product: 'Product A',
      type: 'OUT',
      quantity: 10,
      reference: 'REF002'
    },
    {
      date: '2023-10-02 08:45',
      product: 'Product C',
      type: 'IN',
      quantity: 50,
      reference: 'REF003'
    }
  ];

  // Event handler for dropdown changes
  onDropdownChange(field: string, value: any) {
    console.log(`${field} changed to:`, value);
  }

  // Save new record
  saveMovement() {
    if (this.selectedProduct && this.selectedMovementType && this.selectedQuantity && this.selectedReference) {
      this.movements.unshift({
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        product: this.productOptions.find(p => p.value === this.selectedProduct)?.label || '',
        type: this.selectedMovementType,
        quantity: this.selectedQuantity,
        reference: this.selectedReference
      });

      // reset selections
      this.selectedProduct = null;
      this.selectedMovementType = null;
      this.selectedQuantity = null;
      this.selectedReference = null;
    } else {
      alert('Please select all fields before saving.');
    }
  }
}