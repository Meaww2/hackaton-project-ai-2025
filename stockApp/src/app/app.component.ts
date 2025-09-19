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
}
