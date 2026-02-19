import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Nombres mexicanos realistas
const firstNames = [
  'Carlos', 'Miguel', 'Juan', 'José', 'Luis', 'Fernando', 'Ricardo', 'Eduardo',
  'Alejandro', 'Roberto', 'Pedro', 'Andrés', 'Marco', 'Raúl', 'Francisco',
  'Daniel', 'Jorge', 'Sergio', 'Manuel', 'David', 'Arturo', 'Enrique',
  'Gustavo', 'Héctor', 'Oscar', 'Rafael', 'Guillermo', 'Pablo', 'Salvador',
  'Jesús', 'Antonio', 'Adrián', 'Gabriel', 'Mario', 'Tomás', 'Rodrigo',
  'Diego', 'Iván', 'Hugo', 'César'
];

const lastNames = [
  'García', 'Hernández', 'López', 'Martínez', 'González', 'Rodríguez',
  'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales',
  'Reyes', 'Ruiz', 'Díaz', 'Torres', 'Vargas', 'Castillo', 'Mendoza',
  'Ortiz', 'Juárez', 'Moreno', 'Romero', 'Gutiérrez', 'Medina', 'Aguilar',
  'Vega', 'Domínguez', 'Castro', 'Jiménez', 'Silva', 'Rojas', 'Delgado',
  'Navarro', 'Guerrero', 'Ramos', 'Salazar', 'Contreras', 'Cervantes'
];

const motorcycles = [
  'Honda CB190R', 'Yamaha FZ25', 'Suzuki Gixxer 150', 'Italika FT150',
  'Italika DM150', 'Honda XR150L', 'Yamaha YBR125', 'Bajaj Pulsar NS200',
  'KTM Duke 200', 'Honda CGL125', 'Yamaha MT-03', 'Suzuki GSX-R150',
  'Italika 250Z', 'Honda Navi', 'Yamaha NMAX', 'Italika DS150',
  'Bajaj Dominar 250', 'KTM RC200', 'Honda CB300R', 'Yamaha R3',
  'Suzuki V-Strom 250', 'Italika AT110', 'Honda PCX', 'Yamaha Xmax',
  'Kawasaki Ninja 400', 'BMW G310R', 'Ducati Scrambler', 'Harley Sportster',
  'Vento Crossmax', 'Keeway RKS150'
];

const serviceTypes = [
  'Servicio General', 'Cambio de Aceite', 'Afinación Mayor', 'Afinación Menor',
  'Reparación de Motor', 'Cambio de Frenos', 'Revisión Eléctrica', 'Cambio de Cadena',
  'Reparación de Transmisión', 'Cambio de Llantas', 'Pintura', 'Reparación de Suspensión',
  'Diagnóstico General', 'Cambio de Clutch', 'Rectificación de Motor'
];

const statuses = ['RECEIVED', 'IN_DIAGNOSIS', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
  const area = ['951', '222', '55', '33', '81'][Math.floor(Math.random() * 5)];
  const num = Math.floor(Math.random() * 90000000 + 10000000);
  return `+52${area}${num}`.substring(0, 14);
}

function generateServiceCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RCN-';
  for (let i = 0; i < 9; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function main() {
  console.log('🦝 Sembrando datos de prueba para paginación...\n');

  const hashedPassword = await bcrypt.hash('Temp1234!', 10);

  // Crear 40 clientes
  const customers = [];
  const usedEmails = new Set();

  for (let i = 0; i < 40; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    let email;
    do {
      const num = Math.floor(Math.random() * 9999);
      email = `${firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}${num}@test.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    try {
      const customer = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: generatePhone(),
          role: 'CUSTOMER',
          isActive: true,
          emailVerified: false
        }
      });
      customers.push(customer);
      process.stdout.write(`\r  Clientes creados: ${customers.length}/40`);
    } catch (e) {
      // Email duplicado, skip
      i--;
    }
  }
  console.log(' ✅');

  // Crear 50 servicios distribuidos en diferentes estados
  const usedCodes = new Set();
  let servicesCreated = 0;

  // Distribución: 8 RECEIVED, 8 IN_DIAGNOSIS, 10 IN_REPAIR, 5 READY_FOR_PICKUP, 15 DELIVERED, 4 CANCELLED
  const statusDistribution = [
    ...Array(8).fill('RECEIVED'),
    ...Array(8).fill('IN_DIAGNOSIS'),
    ...Array(10).fill('IN_REPAIR'),
    ...Array(5).fill('READY_FOR_PICKUP'),
    ...Array(15).fill('DELIVERED'),
    ...Array(4).fill('CANCELLED')
  ];

  for (let i = 0; i < 50; i++) {
    const customer = randomItem(customers);
    const status = statusDistribution[i];

    let code;
    do {
      code = generateServiceCode();
    } while (usedCodes.has(code));
    usedCodes.add(code);

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60)); // Últimos 60 días

    try {
      await prisma.service.create({
        data: {
          code,
          customerId: customer.id,
          motorcycle: randomItem(motorcycles),
          serviceType: randomItem(serviceTypes),
          status,
          notes: Math.random() > 0.5 ? 'Servicio de prueba para paginación' : null,
          createdAt,
          statusHistory: {
            create: {
              status,
              notes: 'Servicio creado (seed)',
              changedBy: 'seed-script'
            }
          }
        }
      });
      servicesCreated++;
      process.stdout.write(`\r  Servicios creados: ${servicesCreated}/50`);
    } catch (e) {
      console.error(`\n  Error creando servicio: ${e.message}`);
      i--;
    }
  }
  console.log(' ✅');

  console.log(`
📊 Resumen:
   - ${customers.length} clientes de prueba creados
   - ${servicesCreated} servicios creados
   - Distribución de estados:
     • Recibido: 8
     • En Diagnóstico: 8
     • En Reparación: 10
     • Listo para Entrega: 5
     • Entregado: 15
     • Cancelado: 4

🔢 Con 12 elementos por página, deberías ver:
   - Servicios Activos: ~31 servicios → 3 páginas
   - Servicios Completados: ~19 servicios → 2 páginas
   - Clientes: 40 clientes → 4 páginas

🧹 Para eliminar los datos de prueba después:
   node prisma/cleanup-test-data.js
`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
