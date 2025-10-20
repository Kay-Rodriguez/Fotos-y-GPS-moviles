# 📸 Foto GPS – App Móvil con Ubicación

Esta aplicación móvil permite tomar fotos desde el dispositivo, obtener la ubicación GPS en tiempo real, generar un enlace directo a Google Maps y guardar toda esa información en un archivo `.txt`. Las fotos se muestran en una galería dentro de la app, junto con el enlace a la ubicación donde fueron tomadas.

---

## 🚀 Funcionalidades

- 📷 Tomar fotos con la cámara del dispositivo
- 🛰️ Obtener latitud y longitud usando GPS
- 🗺️ Generar enlace de ubicación en Google Maps
- 📝 Guardar la información en un archivo `.txt` dentro del dispositivo
- 🖼️ Mostrar las fotos en una galería con su enlace de ubicación

---

## 📁 Estructura del proyecto

- `photo.ts`: Servicio que gestiona la captura de fotos, ubicación y guardado de archivos
- `tab2.page.ts`: Página que muestra la galería y llama al servicio
- `tab2.page.html`: Vista con botón de cámara, galería de fotos y enlaces

---

## 📱 Requisitos

- Ionic + Capacitor
- Plugins instalados:
  - `@capacitor/camera`
  - `@capacitor/geolocation`
  - `@capacitor/filesystem`
  - `@capacitor/preferences`

---

## 🔧 Instalación y ejecución

```bash
npm install
ionic build
ionic cap sync
ionic cap open android
