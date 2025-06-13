import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  inject,
  Input,
  QueryList,
  ViewChild,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  MatColumnDef,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  FilterBarComponent,
  FilterConfig,
} from '../shared/filter-bar/filter-bar.component';
import { SecuritiesFilter } from '../../models/securities-filter';
import { SecurityService } from '../../services/security.service';
import { Security } from '../../models/security';
import { ChangeDetectorRef } from '@angular/core';
import {
  MatPaginator,
  PageEvent,
  MatPaginatorModule,
} from '@angular/material/paginator';

@Component({
  selector: 'filterable-table',
  standalone: true,
  imports: [
    MatProgressSpinner,
    MatTable,
    FilterBarComponent,
    MatPaginatorModule,
  ],
  templateUrl: './filterable-table.component.html',
  styleUrl: './filterable-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterableTableComponent implements AfterContentInit {
  @ContentChildren(MatHeaderRowDef) headerRowDefs?: QueryList<MatHeaderRowDef>;
  @ContentChildren(MatRowDef) rowDefs?: QueryList<MatRowDef<Security>>;
  @ContentChildren(MatColumnDef) columnDefs?: QueryList<MatColumnDef>;
  @ContentChild(MatNoDataRow) noDataRow?: MatNoDataRow;

  @ViewChild(MatTable, { static: true }) table?: MatTable<Security>;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  @Input() columns: string[] = [];

  @Input() dataSource:
    | readonly Security[]
    | DataSource<Security>
    | Observable<readonly Security[]>
    | null = null;
  @Input() isLoading: boolean | null = false;

  filters: SecuritiesFilter = {};
  filterConfig: FilterConfig[] = [
    { key: 'name', type: 'text', label: 'Name' },
    {
      key: 'types',
      type: 'chip-input',
      label: 'Types',
    },
    { key: 'currencies', type: 'chip-input', label: 'Currencies' },
    {
      key: 'isPrivate',
      type: 'dropdown',
      label: 'Private',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
        { value: null, label: 'Any' },
      ],
    },
  ];
  itemsPerPage = 10;
  currentPage = 0;
  totalCount = 0;

  private securityService = inject(SecurityService);
  protected loadingSecurities$ = new BehaviorSubject<boolean>(false);
  private cdr = inject(ChangeDetectorRef);

  public ngAfterContentInit(): void {
    this.columnDefs?.forEach((columnDef) =>
      this.table?.addColumnDef(columnDef)
    );
    this.rowDefs?.forEach((rowDef) => this.table?.addRowDef(rowDef));
    this.headerRowDefs?.forEach((headerRowDef) =>
      this.table?.addHeaderRowDef(headerRowDef)
    );
    this.table?.setNoDataRow(this.noDataRow ?? null);
  }

  ngOnInit() {
    this.fetchFilteredData();
  }

  onFiltersChanged(newFilters: SecuritiesFilter) {
    this.filters = newFilters;
    this.fetchFilteredData();
  }

  fetchFilteredData() {
    this.loadingSecurities$.next(true);
    this.isLoading = true;
    this.cdr.markForCheck();
    const skip = this.currentPage * this.itemsPerPage;
    const limit = skip + this.itemsPerPage;
    if (this.filters) {
      this.filters.skip = skip;
      this.filters.limit = limit;
    } else {
      this.filters = { skip, limit };
    }
    this.securityService.getSecurities(this.filters).subscribe((data) => {
      this.dataSource = data.securities;
      this.totalCount = data.totalCount;
      this.loadingSecurities$.next(false);
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    this.fetchFilteredData();
  }
}

/**
 * Changes made to the original code:
 * 1. Added OnInit lifecycle hook to fetch initial data + apply pagination on initial load.
 * 2. Added MatPaginator to handle pagination.
 * 3. Added `fetchFilteredData` method to fetch data based on filters and pagination.
 * 4. Added `onFiltersChanged` method to fetch data when filters change.
 * 5. Added `filterConfig` to define the filter fields and their types.
 * 6. Imported necessary Angular Material components for the UI.
 * */
