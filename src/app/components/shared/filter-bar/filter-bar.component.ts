import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

export interface FilterConfig {
  key: string;
  type: 'text' | 'chip-input' | 'checkbox' | 'dropdown';
  label: string;
  options?: any[];
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    CommonModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent {
  @Input() config: FilterConfig[] = [];
  @Output() filtersChanged = new EventEmitter<any>();

  filters: any = {};

  addChip(event: MatChipInputEvent, key: string) {
    const value = event.value.trim();
    if (value) {
      if (!this.filters[key]) this.filters[key] = [];
      this.filters[key].push(value);
    }
    event.chipInput!.clear();
    this.updateFilters(key, this.filters[key]);
  }

  removeChip(key: string, value: string) {
    if (this.filters[key]) {
      this.filters[key] = this.filters[key].filter(
        (chip: string) => chip !== value
      );
    }

    this.updateFilters(key, this.filters[key]);
  }

  checkFilters() {
    return Object.values(this.filters).some(
      (filterValue) =>
        filterValue !== undefined &&
        filterValue !== null &&
        (Array.isArray(filterValue)
          ? filterValue.length > 0
          : typeof filterValue === 'string'
          ? filterValue.trim() !== ''
          : true)
    );
  }

  updateFilters(key: string, value: any) {
    this.filters[key] = value;

    const filteredFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, filterValue]) => {
        // Remove null values
        if (filterValue === null) {
          return false;
        }
        // Keep both true and false values
        if (typeof filterValue === 'boolean') {
          return true;
        }
        // Remove empty arrays
        if (Array.isArray(filterValue)) {
          return filterValue.length > 0;
        }
        // Remove empty strings
        if (typeof filterValue === 'string') {
          return filterValue.trim() !== '';
        }
        // Remove undefined values
        return filterValue !== undefined;
      })
    );

    this.filtersChanged.emit(
      Object.keys(filteredFilters).length > 0 ? filteredFilters : undefined
    );
  }
}
