# Foto_GPS

Esta aplicación móvil permite tomar fotos desde el dispositivo, obtener la ubicación GPS en tiempo real, generar un enlace directo a Google Maps y guardar toda esa información en un archivo `.txt`.

---

## Funcionalidades

- Tomar fotos con la cámara del dispositivo
- Generar enlace de ubicación en Google Maps
- Guardar la información en un archivo `.txt` dentro del dispositivo
- Mostrar las fotos en una galería con su enlace de ubicación

---

## 📁 Estructura del proyecto

- `photo.ts`: Servicio que gestiona la captura de fotos, ubicación y guardado de archivos
- `tab2.page.ts`: Página que muestra la galería y llama al servicio
- `tab2.page.html`: Vista con botón de cámara, galería de fotos y enlaces

---

## Proceso

- Instalamos Geolocation y Filesystem, ya que camara ya lo teniamos instalado
<img width="697" height="378" alt="image" src="https://github.com/user-attachments/assets/77c0daf4-ea34-42a9-8da3-da496584591c" />
- Añadimos en la funcion addPhotoGallery() un enlace compatible con google maps para acceder a la ubicacion, ademas incluimos el mapslink para la ubicacion.
- Librerias
<img width="596" height="128" alt="image" src="https://github.com/user-attachments/assets/c8258df6-66e4-4e31-b7d8-29409e843c87" />

-ubicacion
<img width="669" height="423" alt="image" src="https://github.com/user-attachments/assets/7dc28cd7-54c5-47c5-959c-467e20733248" />

-Enlace de ubicacion
<img width="687" height="148" alt="image" src="https://github.com/user-attachments/assets/083a9708-d03b-403c-a7ba-818dc7087d05" />

- Permisos en el AndroidManifest.xml
<img width="573" height="181" alt="image" src="https://github.com/user-attachments/assets/56105689-b4be-4577-98f8-b89b09e4e487" />
---

## Ejecución

- Sincronizamos el proyecto
<img width="682" height="263" alt="image" src="https://github.com/user-attachments/assets/ac4db992-904b-478c-b308-580e1a5df378" />
<img width="680" height="232" alt="image" src="https://github.com/user-attachments/assets/633d3bb4-65b8-467c-80c9-73dc9023d765" />
<img width="681" height="191" alt="image" src="https://github.com/user-attachments/assets/fc2df80d-8eb0-438f-a270-f0bc68daaad4" />
- Ejecutamos en Android Studio
<img width="255" height="513" alt="image" src="https://github.com/user-attachments/assets/52c76b53-4fa0-4b3f-b621-c5746d6d5dd8" />
<img width="229" height="504" alt="image" src="https://github.com/user-attachments/assets/2e0c0de3-503d-4e14-86c2-5bf6d47cb7bc" />
<img width="264" height="513" alt="image" src="https://github.com/user-attachments/assets/52f6bc4e-1796-4697-b95a-125791469c0b" />
<img width="267" height="525" alt="image" src="https://github.com/user-attachments/assets/eb3397e2-5f41-4b94-89f8-01ba1a1b42e8" />
<img width="244" height="496" alt="image" src="https://github.com/user-attachments/assets/ce95acd2-4d12-4b30-975e-e74ca05a69c7" />
<img width="256" height="517" alt="image" src="https://github.com/user-attachments/assets/4764037b-ed95-47c1-8932-d330e481585b" />
- En el navegador
<img width="1090" height="687" alt="image" src="https://github.com/user-attachments/assets/dfa2b88d-2d24-4069-a1d8-82b1edb99e69" />

- APK
<img width="761" height="288" alt="image" src="https://github.com/user-attachments/assets/87269832-65fb-4322-8faf-0445b65d80e5" />

<img width="1232" height="711" alt="image" src="https://github.com/user-attachments/assets/ebdf40b9-c82d-442d-9f56-34bdab2a092d" />
