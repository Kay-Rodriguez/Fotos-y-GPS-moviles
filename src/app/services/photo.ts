import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Geolocation } from "@capacitor/geolocation";

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  mapsLink?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  constructor() {}

  public async addPhotoToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const position = await Geolocation.getCurrentPosition();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    const savedImageFile = await this.savePicture(capturedPhoto);
    savedImageFile.mapsLink = mapsLink;

    const log = `Foto tomada\nLatitud: ${lat}\nLongitud: ${lon}\nLink: ${mapsLink}\n`;
      await Filesystem.writeFile({
        path: `foto_ubicacion_${new Date().getTime()}.txt`,
        data: log,
        directory: Directory.Documents,
      });

    this.photos.unshift(savedImageFile);

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  private async savePicture(photo: Photo): Promise<UserPhoto> {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    const base64Data = await this.convertBlobToBase64(blob) as string;

    const fileName = new Date().getTime() + '.jpeg';
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = value ? JSON.parse(value) : [];

    for (let photo of this.photos) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }
}
