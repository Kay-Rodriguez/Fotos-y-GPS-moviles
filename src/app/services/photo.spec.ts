// ...existing code...
import { TestBed } from '@angular/core/testing';
import { PhotoService } from './photo';
import { LocationService } from './location';

describe('PhotoService', () => {
  let service: PhotoService;

  const mockLocationService = {
    ensurePermissions: jasmine.createSpy('ensurePermissions').and.returnValue(Promise.resolve()),
    getCurrentPosition: jasmine.createSpy('getCurrentPosition').and.returnValue(Promise.resolve({
      coords: { latitude: 0, longitude: 0 }
    }))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PhotoService,
        { provide: LocationService, useValue: mockLocationService }
      ]
    });
    service = TestBed.inject(PhotoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
// ...existing code...