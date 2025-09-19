import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

interface Item {
  label: string;
  value: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'stockApp';
  public selectedItem: Item | null = null;

  public items: Item[] = [
    { label: 'Home', value: 'home' },
    { label: 'Profile', value: 'profile' },
    { label: 'Settings', value: 'settings' },
  ];

  public onItemChange(event: any) {
    console.log('Selected:', event.value);
  }

  products: any[] = [];
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<any[]>('http://localhost:3000/products')
      .subscribe(data => this.products = data);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('name', 'Test Product');
    formData.append('price', '100');
    formData.append('image', this.selectedFile);

    this.http.post('http://localhost:3000/products', formData)
      .subscribe(() => this.loadProducts());
  }
}
