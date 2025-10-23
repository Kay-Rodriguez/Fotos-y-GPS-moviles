import { Injectable } from '@angular/core';
import { Camera, CameraPhoto, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { LocationService } from './location';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  constructor(private locationService: LocationService) { }

  // Toma una nueva foto y la guarda con la ubicación actual
  public async addNewToGallery() {
    // Tomar foto desde la cámara
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    // Obtener ubicación actual usando LocationService
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      await this.locationService.ensurePermissions();
      const position = await this.locationService.getCurrentPosition();
      lat = position.coords.latitude;
      lng = position.coords.longitude;
    } catch (e) {
      console.warn('No se pudo obtener la ubicación', e);
    }

    // Guardar en filesystem
    const savedImageFile = await this.savePicture(capturedPhoto);

    // Agregar lat/lng a la foto
    const photoWithLocation: UserPhoto = {
      ...savedImageFile,
      lat,
      lng
    };

    // Agregar al inicio cada foto nueva
    this.photos.unshift(photoWithLocation);

    // Guardar el arreglo completo en Preferences
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    // Guardar ubicación en txt
    if (lat !== undefined && lng !== undefined) {
      await Filesystem.appendFile({
        path: 'ubicaciones.txt',
        data: `${lat},${lng}\n`,
        directory: Directory.Data
      });
    }

    console.log('Foto capturada y guardada:', photoWithLocation);
    return photoWithLocation;
  }

  // Cargar las fotos guardadas desde Preferences y Filesystem
  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    // Leer cada foto desde el filesystem y reconstruir la ruta
    for (let photo of this.photos) {
      try {
        const file = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        });
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      } catch (e) {
        // Si no se puede leer, mantener la webviewPath original
      }
    }

    console.log('Fotos cargadas desde almacenamiento:', this.photos);
  }

  // Guardar cada foto en el filesystem
  private async savePicture(photo: CameraPhoto) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = Date.now() + '.jpeg';
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }

  // Convertir las fotos a base64
  private async readAsBase64(photo: CameraPhoto) {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  // Convertir un Blob a base64
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  lat?: number;
  lng?: number;
}

export interface Photo {
  filepath: string;
  webviewPath: string;
  lat?: number;
  lng?: number;
}