const { PrismaClient } = require("@prisma/client");

// Un seul client Prisma partagé par toute l'app (bonne pratique Express + Prisma).
const prisma = new PrismaClient();

module.exports = prisma;
