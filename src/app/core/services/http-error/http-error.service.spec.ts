import { TestBed } from '@angular/core/testing';

import { HttpErrorService } from './http-error.service';

describe('HttpErrorServiceService', () => {
  let service: HttpErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
