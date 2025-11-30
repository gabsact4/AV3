import { PrismaClient, UserRole, AircraftType, PartType, PartStatus, StageStatus, TestType, TestResult } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar tabelas (em ordem para respeitar as constraints de FK)
  console.log('🧹 Limpando tabelas...');
  await prisma.stageAssignment.deleteMany();
  await prisma.test.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.part.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.user.deleteMany();

  // Criar Usuários
  console.log('👥 Criando usuários...');
  const users = await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador Sistema',
        phone: '(11) 99999-9999',
        address: 'Av. Principal, 123 - São Paulo, SP',
        role: UserRole.ADMIN,
      },
      {
        username: 'engenheiro1',
        password: 'eng123',
        name: 'Carlos Silva',
        phone: '(11) 98888-8888',
        address: 'Rua das Flores, 456 - São Paulo, SP',
        role: UserRole.ENGINEER,
      },
      {
        username: 'operador1',
        password: 'op123',
        name: 'Ana Souza',
        phone: '(11) 97777-7777',
        address: 'Alameda Santos, 789 - São Paulo, SP',
        role: UserRole.OPERATOR,
      },
      {
        username: 'engenheiro2',
        password: 'eng456',
        name: 'Mariana Oliveira',
        phone: '(11) 96666-6666',
        address: 'Praça da Sé, 321 - São Paulo, SP',
        role: UserRole.ENGINEER,
      },
      {
        username: 'operador2',
        password: 'op456',
        name: 'João Santos',
        phone: '(11) 95555-5555',
        address: 'Rua Augusta, 654 - São Paulo, SP',
        role: UserRole.OPERATOR,
      },
    ],
  });

  // Buscar usuários criados para usar nos relacionamentos
  const userAdmin = await prisma.user.findFirst({ where: { username: 'admin' } });
  const userEng1 = await prisma.user.findFirst({ where: { username: 'engenheiro1' } });
  const userEng2 = await prisma.user.findFirst({ where: { username: 'engenheiro2' } });
  const userOp1 = await prisma.user.findFirst({ where: { username: 'operador1' } });
  const userOp2 = await prisma.user.findFirst({ where: { username: 'operador2' } });

  // Criar Aeronaves
  console.log('✈️ Criando aeronaves...');
  const aircraft1 = await prisma.aircraft.create({
    data: {
      code: 'XP-01',
      model: 'Embraer E195-E2',
      type: AircraftType.COMMERCIAL,
      capacity: 136,
      range: 4800,
    },
  });

  const aircraft2 = await prisma.aircraft.create({
    data: {
      code: 'F-22A',
      model: 'Lockheed Martin F-22 Raptor',
      type: AircraftType.MILITARY,
      capacity: 1,
      range: 3200,
    },
  });

  const aircraft3 = await prisma.aircraft.create({
    data: {
      code: 'A320-01',
      model: 'Airbus A320neo',
      type: AircraftType.COMMERCIAL,
      capacity: 180,
      range: 6300,
    },
  });

  // Criar Peças para as aeronaves
  console.log('🔩 Criando peças...');
  const partsAircraft1 = await prisma.part.createMany({
    data: [
      {
        name: 'Motor Principal CF34',
        type: PartType.IMPORTED,
        supplier: 'General Electric',
        status: PartStatus.READY,
        aircraftId: aircraft1.id,
      },
      {
        name: 'Trem de Pouso Dianteiro',
        type: PartType.NATIONAL,
        supplier: 'Embraer',
        status: PartStatus.IN_PRODUCTION,
        aircraftId: aircraft1.id,
      },
      {
        name: 'Sistema de Navegação',
        type: PartType.IMPORTED,
        supplier: 'Honeywell',
        status: PartStatus.IN_TRANSPORT,
        aircraftId: aircraft1.id,
      },
      {
        name: 'Asa Esquerda',
        type: PartType.NATIONAL,
        supplier: 'Embraer',
        status: PartStatus.READY,
        aircraftId: aircraft1.id,
      },
    ],
  });

  const partsAircraft2 = await prisma.part.createMany({
    data: [
      {
        name: 'Motor Pratt & Whitney F119',
        type: PartType.IMPORTED,
        supplier: 'Pratt & Whitney',
        status: PartStatus.IN_PRODUCTION,
        aircraftId: aircraft2.id,
      },
      {
        name: 'Sistema de Mísseis',
        type: PartType.IMPORTED,
        supplier: 'Raytheon',
        status: PartStatus.IN_TRANSPORT,
        aircraftId: aircraft2.id,
      },
      {
        name: 'Radar AESA',
        type: PartType.IMPORTED,
        supplier: 'Northrop Grumman',
        status: PartStatus.READY,
        aircraftId: aircraft2.id,
      },
    ],
  });

  // Criar Estágios de Produção
  console.log('🏗️ Criando estágios...');
  const stagesAircraft1 = await prisma.stage.createMany({
    data: [
      {
        name: 'Montagem da Fuselagem',
        deadline: 30,
        status: StageStatus.COMPLETED,
        aircraftId: aircraft1.id,
      },
      {
        name: 'Instalação de Sistemas Elétricos',
        deadline: 15,
        status: StageStatus.IN_PROGRESS,
        aircraftId: aircraft1.id,
      },
      {
        name: 'Testes de Integração',
        deadline: 10,
        status: StageStatus.PENDING,
        aircraftId: aircraft1.id,
      },
      {
        name: 'Pintura e Acabamento',
        deadline: 7,
        status: StageStatus.PENDING,
        aircraftId: aircraft1.id,
      },
    ],
  });

  const stagesAircraft2 = await prisma.stage.createMany({
    data: [
      {
        name: 'Montagem Estrutural',
        deadline: 45,
        status: StageStatus.IN_PROGRESS,
        aircraftId: aircraft2.id,
      },
      {
        name: 'Sistemas Aviónicos',
        deadline: 20,
        status: StageStatus.PENDING,
        aircraftId: aircraft2.id,
      },
      {
        name: 'Armamento',
        deadline: 15,
        status: StageStatus.PENDING,
        aircraftId: aircraft2.id,
      },
    ],
  });

  // Buscar estágios criados para atribuir usuários
  const stage1 = await prisma.stage.findFirst({ where: { name: 'Montagem da Fuselagem', aircraftId: aircraft1.id } });
  const stage2 = await prisma.stage.findFirst({ where: { name: 'Instalação de Sistemas Elétricos', aircraftId: aircraft1.id } });
  const stage3 = await prisma.stage.findFirst({ where: { name: 'Montagem Estrutural', aircraftId: aircraft2.id } });

  // Atribuir usuários aos estágios
  console.log('👥 Atribuindo usuários aos estágios...');
  if (stage1 && userEng1 && userOp1) {
    await prisma.stageAssignment.createMany({
      data: [
        { stageId: stage1.id, userId: userEng1.id },
        { stageId: stage1.id, userId: userOp1.id },
      ],
    });
  }

  if (stage2 && userEng2) {
    await prisma.stageAssignment.create({
      data: { stageId: stage2.id, userId: userEng2.id },
    });
  }

  if (stage3 && userEng1 && userEng2) {
    await prisma.stageAssignment.createMany({
      data: [
        { stageId: stage3.id, userId: userEng1.id },
        { stageId: stage3.id, userId: userEng2.id },
      ],
    });
  }

  await prisma.test.createMany({
    data: [
      {
        type: TestType.ELECTRICAL,
        result: TestResult.APPROVED,
        aircraftId: aircraft1.id,
      },
      {
        type: TestType.HYDRAULIC,
        result: TestResult.APPROVED,
        aircraftId: aircraft1.id,
      },
      {
        type: TestType.AERODYNAMIC,
        result: null, // Teste pendente
        aircraftId: aircraft1.id,
      },
      {
        type: TestType.ELECTRICAL,
        result: TestResult.REJECTED,
        aircraftId: aircraft2.id,
      },
      {
        type: TestType.HYDRAULIC,
        result: null, // Teste pendente
        aircraftId: aircraft2.id,
      },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('📊 Resumo:');
  console.log(`   👥 Usuários: 5 criados`);
  console.log(`   ✈️ Aeronaves: 3 criadas`);
  console.log(`   🔩 Peças: 7 criadas`);
  console.log(`   🏗️ Estágios: 7 criados`);
  console.log(`   👥 Atribuições: 5 criadas`);
  console.log(`   🧪 Testes: 5 criados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });