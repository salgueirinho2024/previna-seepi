import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding banco de dados...");

  const passwordHash = await bcrypt.hash("123456", 10);

  const empresa = await prisma.empresa.upsert({
    where: { id: "empresa-demo" },
    update: {},
    create: {
      id: "empresa-demo",
      nome: "Bambuí Bioenergia S/A",
      cnpj: "00.000.000/0001-00",
      unidades: {
        create: [{ nome: "Matriz" }, { nome: "Unidade Industrial" }],
      },
      users: {
        create: {
          name: "Administrador",
          email: "admin@demo.com",
          passwordHash,
          role: "admin",
        },
      },
    },
    include: { unidades: true },
  });

  const [matriz, unidadeIndustrial] = empresa.unidades;

  const colaboradores = await Promise.all(
    [
      { nome: "João da Silva", matricula: "FUNC001", cpf: "111.111.111-11", cargo: "Operador de Produção", setor: "Produção", unidadeId: unidadeIndustrial.id },
      { nome: "Maria Oliveira", matricula: "FUNC002", cpf: "222.222.222-22", cargo: "Técnica de Segurança", setor: "SSMA", unidadeId: matriz.id },
      { nome: "Carlos Souza", matricula: "FUNC003", cpf: "333.333.333-33", cargo: "Eletricista", setor: "Manutenção", unidadeId: unidadeIndustrial.id },
    ].map((data) =>
      prisma.colaborador.create({ data: { ...data, empresaId: empresa.id } })
    )
  );

  const itens = await Promise.all(
    [
      { nome: "Capacete de Segurança 3M H-700", ca: "29638", fabricante: "3M", categoriaNR: "EPI (NR-6) • Proteção do crânio", custoUnitario: 35.9, periodicidadeDias: 730, estoqueAtual: 40, estoqueMinimo: 10 },
      { nome: "Óculos de Proteção Steel Pro", ca: "17772", fabricante: "Steel Pro", categoriaNR: "EPI (NR-6) • Proteção ocular", custoUnitario: 12.5, periodicidadeDias: 180, estoqueAtual: 60, estoqueMinimo: 15 },
      { nome: "Luva de Raspa de Couro", ca: "34567", fabricante: "Volk", categoriaNR: "EPI (NR-6) • Proteção das mãos", custoUnitario: 18.0, periodicidadeDias: 90, estoqueAtual: 8, estoqueMinimo: 20 },
      { nome: "Protetor Auricular Plug", ca: "5745", fabricante: "3M", categoriaNR: "EPI (NR-6) • Proteção auditiva", custoUnitario: 3.2, periodicidadeDias: 60, estoqueAtual: 100, estoqueMinimo: 30 },
      { nome: "Botina de Segurança com Bico PVC", ca: "41123", fabricante: "Vulcabras", categoriaNR: "EPI (NR-6) • Proteção dos pés", custoUnitario: 89.9, periodicidadeDias: 365, estoqueAtual: 25, estoqueMinimo: 10 },
    ].map((data) => prisma.itemEPI.create({ data: { ...data, empresaId: empresa.id } }))
  );

  const [capacete, oculos, luva] = itens;
  const [joao, maria] = colaboradores;

  // Solicitação + entrega já concluída e assinada, para popular a Ficha de EPI de exemplo
  const solicitacao = await prisma.solicitacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: joao.id,
      motivo: "Primeira entrega",
      status: "entregue",
      itens: {
        create: [
          { itemId: capacete.id, quantidade: 1 },
          { itemId: oculos.id, quantidade: 1 },
          { itemId: luva.id, quantidade: 2 },
        ],
      },
    },
  });

  await prisma.entrega.create({
    data: {
      empresaId: empresa.id,
      solicitacaoId: solicitacao.id,
      colaboradorId: joao.id,
      assinado: true,
      assinaturaTipo: "digital",
      assinadoEm: new Date(),
      itens: {
        create: [
          { itemId: capacete.id, quantidade: 1, proximaTroca: new Date(Date.now() + 730 * 86400000) },
          { itemId: oculos.id, quantidade: 1, proximaTroca: new Date(Date.now() + 180 * 86400000) },
          { itemId: luva.id, quantidade: 2, proximaTroca: new Date(Date.now() + 90 * 86400000) },
        ],
      },
    },
  });

  // Solicitação pendente, para popular a tela de Solicitações
  await prisma.solicitacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: maria.id,
      motivo: "Troca periódica",
      status: "pendente",
      itens: { create: [{ itemId: oculos.id, quantidade: 1 }] },
    },
  });

  console.log("Seed concluído.");
  console.log("Login de teste -> e-mail: admin@demo.com | senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
