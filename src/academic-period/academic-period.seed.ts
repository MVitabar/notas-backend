import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const periods = [
    {
      name: `${currentYear}-1`,
      startDate: new Date(currentYear, 0, 1), // Jan 1
      endDate: new Date(currentYear, 5, 30), // Jun 30
      isCurrent: currentDate.getMonth() <= 5, // First semester
      status: currentDate.getMonth() <= 5 ? 'active' : 'completed',
      description: `First Semester ${currentYear}`,
    },
    {
      name: `${currentYear}-2`,
      startDate: new Date(currentYear, 6, 1), // Jul 1
      endDate: new Date(currentYear, 11, 31), // Dec 31
      isCurrent: currentDate.getMonth() > 5, // Second semester
      status: currentDate.getMonth() > 5 ? 'active' : 'upcoming',
      description: `Second Semester ${currentYear}`,
    },
  ];

  for (const period of periods) {
    await prisma.periodoAcademico.upsert({
      where: { name: period.name },
      update: {},
      create: period,
    });
  }

  console.log('Academic periods seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
