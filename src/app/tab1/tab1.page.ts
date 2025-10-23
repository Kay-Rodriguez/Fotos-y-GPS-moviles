// ...existing code...
import { ToastController } from '@ionic/angular';
import { LocationService } from '../services/location';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../environments/environment';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

@Component({
  standalone: true,
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab1Page implements AfterViewInit {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  private map: any = null;
  private marker: any = null;
  location: LocationData | null = null;

  constructor(
    private loc: LocationService,
    private toastCtrl: ToastController
  ) {}

  async ngAfterViewInit() {
    try {
      await this.loadGoogleMapsScript();
      this.initMap();
    } catch (e) {
      console.warn('Error cargando Google Maps', e);
      await this.presentToast('No se pudo cargar Google Maps (revisa la consola)');
    }
  }

  private loadGoogleMapsScript(): Promise<void> {
    const win = window as any;
    if (win.google && win.google.maps) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbY4lZr8AivZtNCHX-P6gUbpK_QIcPV_U';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  private initMap() {
    const el = this.mapElement?.nativeElement as HTMLElement | undefined;
    if (!el) {
      console.warn('Elemento del mapa no encontrado');
      return;
    }
    // Si quieres que el mapa ocupe más espacio, ajusta la altura en CSS (tab1.page.scss)
    const defaultCenter = { lat: -0.180653, lng: -78.467838 }; // ejemplo: Quito
    this.map = new (window as any).google.maps.Map(el, {
      center: this.location ? { lat: this.location.latitude, lng: this.location.longitude } : defaultCenter,
      zoom: 14
    });

    // Si ya tenemos ubicación, sitúa el marcador
    if (this.location) {
      this.setMarker(this.location.latitude, this.location.longitude);
    }

    // Forzar redraw si el contenedor cambia de tamaño
    (window as any).google.maps.event.addListenerOnce(this.map, 'idle', () => {
      (window as any).google.maps.event.trigger(this.map, 'resize');
    });
  }

  private setMarker(lat: number, lng: number) {
    if (!this.map) return;
    const pos = { lat, lng };
    if (this.marker) {
      this.marker.setPosition(pos);
    } else {
      this.marker = new (window as any).google.maps.Marker({
        position: pos,
        map: this.map
      });
    }
    this.map.setCenter(pos);
  }

  async getCurrentLocation() {
    try {
      await this.loc.ensurePermissions();
      const pos = await this.loc.getCurrentPosition();
      this.location = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: (pos as any).timestamp ?? undefined
      };
      if (this.map && this.location) {
        this.setMarker(this.location.latitude, this.location.longitude);
      }
    } catch (e) {
      console.warn('Error obteniendo ubicación', e);
      await this.presentToast('No se pudo obtener la ubicación');
    }
  }

  async copyLocation() {
    if (!this.location) {
      await this.presentToast('No hay ubicación para copiar');
      return;
    }
    const text = `${this.location.latitude}, ${this.location.longitude}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        await this.presentToast('Coordenadas copiadas al portapapeles');
      } else {
        await this.presentToast('API de portapapeles no disponible');
      }
    } catch (e) {
      console.warn('Error copiando', e);
      await this.presentToast('Error al copiar');
    }
  }

  async shareLocation() {
    if (!this.location) {
      await this.presentToast('No hay ubicación para compartir');
      return;
    }
    const text = `Mi ubicación: ${this.location.latitude}, ${this.location.longitude}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: 'Mi ubicación',
          text
        });
      } else {
        await this.copyLocation();
      }
    } catch (e) {
      console.warn('Error compartiendo', e);
      await this.presentToast('No se pudo compartir la ubicación');
    }
  }

  private async presentToast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800 });
    await t.present();
  }
}
// ...existing code...