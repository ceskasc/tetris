import { ensureCatalogSeeded } from "@/progression/service";
import { ensureTournamentSeeded } from "@/tournaments/service";
import { prisma } from "@/db/prisma";

async function main() {
  await ensureCatalogSeeded();
  await ensureTournamentSeeded();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
