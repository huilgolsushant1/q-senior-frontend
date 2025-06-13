import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Security } from '../models/security';
import { SECURITIES } from '../mocks/securities-mocks';
import { SecuritiesFilter } from '../models/securities-filter';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  /**
   * Get Securities server request mock
   * */
  getSecurities(
    securityFilter?: SecuritiesFilter
  ): Observable<{ securities: Security[]; totalCount: number }> {
    const filteredSecurities = this._filterSecurities(securityFilter).slice(
      securityFilter?.skip ?? 0,
      securityFilter?.limit ?? 100
    );
    const totalCount = this._filterSecurities(securityFilter).length;
    return of({ securities: filteredSecurities, totalCount }).pipe(delay(1000));
  }

  private _filterSecurities(
    securityFilter: SecuritiesFilter | undefined
  ): Security[] {
    if (!securityFilter) return SECURITIES;

    return SECURITIES.filter(
      (s) =>
        (!securityFilter.name || s.name.includes(securityFilter.name)) &&
        (!securityFilter.types ||
          securityFilter.types.some((type) => s.type === type)) &&
        (!securityFilter.currencies ||
          securityFilter.currencies.some(
            (currency) => s.currency == currency
          )) &&
        (securityFilter.isPrivate === undefined ||
          securityFilter.isPrivate === s.isPrivate)
    );
  }
}

/**
 * Changes made to the original code:
 * 1. Passing a new parameter called `totalCount` in the return type of `getSecurities` method. This parameter was needed for pagination.
 * */
