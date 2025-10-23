import { Injectable } from '@angular/core';
import { Geolocation, PermissionStatus, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private isWeb = Capacitor.getPlatform() === 'web';

  // Pide/verifica permisos; retorna estado compatible con PermissionStatus
  async ensurePermissions(): Promise<PermissionStatus> {
    if (!this.isWeb) {
      const perm = await Geolocation.checkPermissions();
      if (perm.location === 'granted' || perm.coarseLocation === 'granted') return perm;
      return Geolocation.requestPermissions();
    }

    // Fallback web: usa Permissions API si está disponible
    if (!('geolocation' in navigator)) {
      return { location: 'denied' } as PermissionStatus;
    }

    try {
      // navigator.permissions puede no existir en todos los navegadores
      const p = (navigator as any).permissions;
      if (p && typeof p.query === 'function') {
        const status = await p.query({ name: 'geolocation' });
        const state = status.state as 'granted' | 'prompt' | 'denied';
        return { location: state } as PermissionStatus;
      }
    } catch {
      // ignore
    }

    // Si no se puede determinar, devolvemos prompt para indicar que debe pedirse
    return { location: 'prompt' } as PermissionStatus;
  }

  // Obtener posición actual (native o web)
  async getCurrentPosition(): Promise<Position> {
    if (!this.isWeb) {
      return Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    }

    return new Promise<Position>((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        return reject(new Error('Geolocation no soportado en el navegador'));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos as unknown as Position),
        (err) => reject(err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    });
  }

  // Inicia watch; retorna id como string para compatibilidad
  async watchPosition(onPos: (p: Position) => void, onErr?: (e: any) => void): Promise<string> {
    if (!this.isWeb) {
      const id = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (pos, err) => {
          if (pos) onPos(pos);
          else if (err && onErr) onErr(err);
        }
      );
      return id as unknown as string;
    }

    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation no soportado en el navegador');
    }

    const numericId = navigator.geolocation.watchPosition(
      (pos) => onPos(pos as unknown as Position),
      (err) => { if (onErr) onErr(err); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return String(numericId);
  }

  // Detener watch por id
  async clearWatch(id: string): Promise<void> {
    if (!this.isWeb) {
      await Geolocation.clearWatch({ id });
      return;
    }

    if (!('geolocation' in navigator)) return;
    const n = Number(id);
    if (!isNaN(n)) navigator.geolocation.clearWatch(n);
  }
}