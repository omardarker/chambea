# Chambea

Demo funcional de un marketplace de servicios para el hogar en Lima, Perú. Conecta a personas que necesitan algo en su casa con trabajadores independientes que lo resuelven.

Es una demo de producto: todo corre en el navegador con datos de ejemplo. No hay backend, registro ni pagos reales. Lo que haces se guarda en `localStorage` y puedes reiniciarlo desde el pie de página o desde el perfil.

## Qué muestra la demo

**Dos formas de contratar**

1. **Catálogo.** Buscas un servicio, ves precio, calificación y perfil del trabajador, y contratas directo eligiendo fecha.
2. **Pedido con contraoferta.** Publicas lo que necesitas con fotos y el monto que pagarías. Los trabajadores de esa categoría aceptan tu precio o contraofertan uno mayor. Comparas ofertas junto al perfil de cada uno y eliges. Este es el diferenciador del producto.

**Inmediato o programado.** Un pedido inmediato expira en tres horas y recibe ofertas al momento. Uno programado lleva fecha y hora.

**Dos roles en una sola app.** Arriba hay un conmutador Cliente / Trabajador. En modo trabajador puedes "ser" cuatro trabajadores distintos para ver pedidos de varias categorías.

**Reglas de confianza que ya están en la demo**

- Perfil de trabajador estilo CV: certificaciones, estudios, experiencia, trabajos anteriores, reseñas.
- Distinción visible entre información **verificada** por la plataforma y **declarada** por el trabajador.
- Pago retenido por la app (Yape, Plin o tarjeta) hasta que el cliente confirma el trabajo. Comisión del 10 %.
- Chat interno en vez de teléfono. La dirección exacta solo se muestra al trabajador elegido.
- Ajuste de cotización en sitio: el trabajador propone un nuevo monto y el cliente lo aprueba desde el chat.
- Calificación en ambos sentidos: los trabajadores también califican a los clientes.
- Trabajadores de confianza para recontratar.
- Separación entre mano de obra y materiales, y visita de diagnóstico opcional.

**La otra parte se simula.** Cuando publicas un pedido, otros trabajadores ofertan en segundos. Cuando ofertas como trabajador, el cliente te elige, responde en el chat, aprueba ajustes y confirma el trabajo. Así se puede recorrer el flujo completo desde cualquiera de los dos lados.

## Categorías

- **Instalaciones del hogar:** gasfitería, electricidad, cerrajería, vidriería y aluminio, instalaciones de gas, CCTV y alarmas, cortinas y persianas.
- **Construcción y acabados:** albañilería, drywall, pisos laminados y vinílicos, pintura, melamina, enchapes y revestimientos, carpintería, herrería y soldadura, impermeabilización.
- **Mantenimiento y montaje:** jardinería, fumigación, instalación de TV en pared, instalación de artefactos.

## Correr el proyecto

Requiere Node 20 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para una build de producción:

```bash
npm run build
npm start
```

Se despliega en Vercel sin configuración: importa el repo y listo.

## Stack

- Next.js 16 con App Router y TypeScript
- Tailwind CSS 4
- Zustand para el estado, persistido en `localStorage`
- Íconos de Lucide

Sin base de datos ni servicios externos. Las "fotos" son placeholders generados en el navegador.

## Estructura

```
src/
  app/                  rutas
    page.tsx            inicio del cliente
    buscar/             catálogo con filtros
    servicios/[id]/     detalle de servicio y contratación
    trabajadores/[id]/  perfil CV del trabajador
    pedidos/            mis pedidos, nuevo pedido, detalle con ofertas y chat
    confianza/          trabajadores guardados
    perfil/             perfil del cliente y reseñas recibidas
    trabajador/         lado del trabajador: pedidos abiertos, mis trabajos, servicios, perfil
  components/
    ui/                 primitivas (botón, chip, avatar, hoja modal, campos)
    app/                shell, tarjetas, chat, pago, calificación, perfil
  lib/
    types.ts            modelo de datos
    store.ts            estado y acciones (crear pedido, ofertar, elegir, pagar, confirmar)
    simulate.ts         simulación de la contraparte
    data/               categorías, distritos, trabajadores, servicios, clientes, reseñas, pedidos iniciales
```

## Fuera del alcance de la demo

Registro y login, pagos reales, subida de fotos, notificaciones push, disputas, geolocalización, y el flujo de obras largas con pagos por avance.
