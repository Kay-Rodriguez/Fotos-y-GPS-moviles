import { Component, OnDestroy, signal, OnInit } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBadge
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { NgIf, NgFor } from '@angular/common';
import { LocationService } from '../services/location';
import { PhotoService } from '../services/photo';
import { Filesystem, Directory, Encoding as FilesystemEncoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-tab3',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonGrid, IonRow, IonCol, IonIcon, IonBadge,
    NgIf, NgFor
  ],
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  errorMsg = signal<string | null>(null);
  seguimientoActivo = false;
  watchId: string | null = null;

  savedFileLink = signal<string | null>(null);
  private createdBlobUrls: string[] = [];

  constructor(
    private loc: LocationService,
    public photoService: PhotoService,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  async obtenerUbicacionActual() {
    try {
      await this.loc.ensurePermissions();
      const pos = await this.loc.getCurrentPosition();
      this.latitude.set(pos.coords.latitude);
      this.longitude.set(pos.coords.longitude);
      this.errorMsg.set(null);
      return pos;
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'Error al obtener la ubicación actual');
      throw e;
    }
  }

  async iniciarSeguimiento() {
    try {
      await this.loc.ensurePermissions();
      this.watchId = await this.loc.watchPosition((pos) => {
        this.latitude.set(pos.coords.latitude);
        this.longitude.set(pos.coords.longitude);
      }, (err) => {
        this.errorMsg.set(err?.message ?? 'Error en seguimiento de ubicación');
      });
      this.seguimientoActivo = true;
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'No se pudo iniciar el seguimiento');
    }
  }

  async detenerSeguimiento() {
    if (this.watchId) {
      await this.loc.clearWatch(this.watchId);
      this.watchId = null;
      this.seguimientoActivo = false;
    }
  }

  async toggleTracking() {
    if (this.seguimientoActivo) await this.detenerSeguimiento();
    else await this.iniciarSeguimiento();
  }

  async savePhotoWithLocation() {
    try {
      const pos = await this.obtenerUbicacionActual();
      const photoWithLocation = await this.photoService.addNewToGallery();

      const ts = pos?.timestamp ?? Date.now();
      const tsIso = new Date(ts).toISOString();
      const filename = `ubicacion_${ts}.txt`;
      const content = [
        `latitude: ${String(photoWithLocation.lat)}`,
        `longitude: ${String(photoWithLocation.lng)}`,
        `accuracy: ${String(pos.coords.accuracy ?? 'n/a')}`,
        `timestamp: ${ts} (${tsIso})`,
        `googleMaps: ${this.getGoogleMapsLink(Number(photoWithLocation.lat), Number(photoWithLocation.lng))}`,
        `photoPath: ${String(photoWithLocation.webviewPath ?? photoWithLocation.filepath ?? 'n/a')}`
      ].join('\n');

      console.log('Guardar ubicación ->', filename, content);

      const platform = Capacitor.getPlatform();
      const isWebLike = platform === 'web' || platform === 'electron' || (typeof window !== 'undefined' && !!(window.document));
      console.log('Platform detectada:', platform, 'isWebLike:', isWebLike);

      if (isWebLike) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        this.createdBlobUrls.push(url);
        this.savedFileLink.set(url);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        await this.presentToast('Archivo descargado', 1800);
        this.errorMsg.set(null);
        return;
      }

      // Escribir archivo en dispositivo
      await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Data,
        encoding: FilesystemEncoding.UTF8
      });

      // Intentar obtener URI para mostrar enlace
      let link: string | null = null;
      try {
        const gu = await Filesystem.getUri({ directory: Directory.Data, path: filename }).catch(() => null);
        if (gu && (gu as any).uri) link = (Capacitor as any).convertFileSrc((gu as any).uri);
      } catch (err) {
        console.warn('No se pudo obtener enlace nativo al archivo:', err);
      }

      this.savedFileLink.set(link ?? null);
      await this.presentToast('Archivo guardado en dispositivo', 1800);
      this.errorMsg.set(null);

    } catch (e: any) {
      console.error('Error guardando foto y ubicación', e);
      this.errorMsg.set(e?.message ?? 'Error al guardar foto y ubicación');
      await this.presentToast('Error al guardar', 2500);
    }
  }

  async presentToast(message: string, duration = 2000) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom'
    });
    await toast.present();
  }

  get coords() {
    const lat = this.latitude();
    const lng = this.longitude();
    return (lat !== null && lng !== null) ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '—';
  }

  get trackingStatus() {
    return this.seguimientoActivo ? 'Activo' : 'Inactivo';
  }

  getGoogleMapsLink(lat: number, lng: number) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  ngOnDestroy() {
    if (this.watchId) this.loc.clearWatch(this.watchId);
    for (const u of this.createdBlobUrls) {
      try { URL.revokeObjectURL(u); } catch {}
    }
    this.createdBlobUrls = [];
  }
}